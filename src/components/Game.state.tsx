import { bn } from "@/lib/bnMath";
import { gameConverter } from "@/lib/firebase/gameConverter";
import { getFirestore } from "@/lib/firebase/getFirestore";
import { portfolioValue } from "@/lib/game/portfolioValue";
import { generateUUID } from "@/lib/generateUUID";
import { relativePriceIndex } from "@/lib/indexWallets/relativePriceIndex";
import { Currency } from "@/types/Currency";
import { GameData } from "@/types/Game";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { produce } from "immer";
import { Atom, atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { withImmer } from "jotai-immer";
import { atomWithObservable, unwrap } from "jotai/utils";
import { BigNumber } from "mathjs";
import { Observable } from "rxjs";

export const gameIdAtom = atom<string>("");

export const updateProvisionalValuationsEffect = atomEffect((get, set) => {
  const currentPlayer = get(maybeCurrentPlayerAtom);
  if (currentPlayer) {
    set(playerProvisionalValuationsAtom, currentPlayer.valuations);
  }
});

const asyncGameAtom = atomWithObservable((get) => {
  const gameId = get(gameIdAtom);

  if (!gameId) {
    return new Observable<GameData | undefined>((subscriber) => {
      subscriber.next(undefined);
      subscriber.complete();
    });
  }

  return new Observable<GameData | undefined>((subscriber) => {
    const unsubscribe = onSnapshot(
      doc(getFirestore(), "games", gameId).withConverter(gameConverter),
      (doc) => {
        const gameData = doc.data();
        subscriber.next(gameData);
      },
    );

    return unsubscribe;
  });
});

export const maybeGameAtom = unwrap(asyncGameAtom);

export const gameAtom = withImmer(
  atom(
    (get) => get(defined(maybeGameAtom)),
    async (get, _set, gameData: GameData) => {
      const gameId = get(gameIdAtom);
      await setDoc(
        doc(getFirestore(), "games", gameId).withConverter(gameConverter),
        gameData,
      );
    },
  ),
);

export const deviceIdAtom = atom(() => {
  const deviceId = sessionStorage.getItem("deviceId");
  if (!deviceId) {
    const newId = generateUUID();
    sessionStorage.setItem("deviceId", newId);
    return newId;
  }

  return deviceId;
});

export const maybeCurrentPlayerAtom = atom((get) => {
  const deviceId = get(deviceIdAtom);
  const game = get(maybeGameAtom);

  return game?.players.find((player) => player.deviceId === deviceId);
});

export const currentPlayerAtom = atom((get) => {
  const currentPlayer = get(maybeCurrentPlayerAtom);

  if (!currentPlayer) {
    throw new Error(
      "currentPlayerAtom should only be used after the game has been initialized.",
    );
  }

  return currentPlayer;
});

export const defined: <T>(innerAtom: Atom<T | undefined>) => Atom<T> = (
  innerAtom,
) =>
  atom((get) => {
    const atomValue = get(innerAtom);

    return (
      atomValue ??
      (() => {
        throw new Error("Atom value is undefined");
      })()
    );
  });

export const playersAtom = atom((get) => {
  const game = get(maybeGameAtom);

  if (!game?.players)
    throw new Error(
      "playersAtom should only be used after the game has been initialized.",
    );
  return game.players;
});

export const otherPlayersAtom = atom((get) => {
  const deviceId = get(deviceIdAtom);
  const game = get(maybeGameAtom);

  if (!game?.players)
    throw new Error(
      "otherPlayersAtom should only be used after the game has been initialized.",
    );
  return game.players.filter((player) => player.deviceId !== deviceId);
});

export const currenciesAtom = atom<Currency[]>((get) => {
  const game = get(defined(maybeGameAtom));
  return game.currencies;
});

export const causesAtom = atom<Currency[]>((get) =>
  get(currenciesAtom).filter((currency) => currency.symbol !== "USD"),
);

export const playerProvisionalValuationsAtom = atom<BigNumber[]>([]);

export const playerValuationsAtom = atom(
  (get) => get(currentPlayerAtom).valuations,
  async (get, _set, newValuations: BigNumber[]) => {
    const gameId = get(gameIdAtom);
    const deviceId = get(deviceIdAtom);
    await setDoc(
      doc(getFirestore(), "games", gameId).withConverter(gameConverter),
      produce(get(maybeGameAtom), (draft) => {
        draft!.players.find(
          (player) => player.deviceId === deviceId,
        )!.valuations = newValuations;
      }),
    );
  },
);

export const activeTabAtom = atom<"wallet" | "pay" | "valuations" | "causes">(
  "wallet",
);

export const purchaseRelativePriceIndexesAtom = atom((get) => {
  const players = get(playersAtom);
  const currentPlayer = get(currentPlayerAtom);
  const provisionalValuations = get(playerProvisionalValuationsAtom);
  return players.reduce(
    (indexes, player) => {
      return {
        ...indexes,
        [player.deviceId]: relativePriceIndex({
          buyerBalances: currentPlayer.balances,
          vendorValuations:
            player.deviceId === currentPlayer.deviceId
              ? provisionalValuations
              : player.valuations,
          viewerValuations: provisionalValuations,
        }),
      };
    },
    {} as Record<string, BigNumber>,
  );
});

// Charities only value USD
export const charityValuationsAtom = atom((get) => [
  bn(1),
  ...new Array(get(currenciesAtom).length - 1).fill(0).map(bn),
]);

export const playerPortfolioValueAtom = atom((get) => {
  const currentPlayer = get(currentPlayerAtom);
  return portfolioValue(currentPlayer);
});

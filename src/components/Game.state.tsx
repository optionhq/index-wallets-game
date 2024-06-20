import { bn } from "@/lib/bnMath";
import { gameConverter } from "@/lib/firebase/gameConverter";
import { getFirestore } from "@/lib/firebase/getFirestore";
import { portfolioValue } from "@/lib/game/portfolioValue";
import { generateId } from "@/lib/generateId";
import { generateUUID } from "@/lib/generateUUID";
import { relativePriceIndex } from "@/lib/indexWallets/relativePriceIndex";
import { Currency } from "@/types/Currency";
import { DbGameData, GameData } from "@/types/Game";
import { Player } from "@/types/Player";
import {
  WithFieldValue,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { produce } from "immer";
import { Atom, Getter, atom } from "jotai";
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

const demoData: () => WithFieldValue<DbGameData> = () => ({
  createdAt: serverTimestamp(),
  players: [
    {
      deviceId: "9ddba007-a4a4-40c1-90a6-3ba7c2ca8cfd",
      name: "Connor",
      balances: ["100", "20", "0", "0"],
      valuations: ["1", "1", "0", "0"],
      cause: "RIVER",
    },
    {
      deviceId: "519dddc1-a3dc-4bb7-86de-7c01a2f5e69a",
      name: "Will",
      balances: ["100", "20", "0", "0"],
      valuations: ["1", "1", "0", "0"],
      cause: "RIVER",
    },
    {
      deviceId: "6e6ac296-44c8-434f-9533-5fea9f59c577",
      name: "Lauren",
      balances: ["100", "0", "20", "0"],
      valuations: ["1", "0", "1", "0"],
      cause: "POLLI",
    },
    {
      deviceId: "069788d9-efa7-43c3-afd2-73fc2e7a1294",
      name: "Julian",
      balances: ["100", "0", "0", "20"],
      valuations: ["1", "0", "0", "1"],
      cause: "PARK",
    },
  ],
  currencies: [
    { name: "US Dollars", symbol: "USD", totalSupply: "0" },
    { name: "River Cleanup", symbol: "RIVER", totalSupply: "40" },
    { name: "Save Pollinators", symbol: "POLLI", totalSupply: "20" },
    { name: "Parks & Trails", symbol: "PARK", totalSupply: "20" },
  ],
});

export const initializeGameAtom = atom(
  null,
  async (get, _set, demoData?: DbGameData) => {
    const gameId = generateId();
    const deviceId = get(deviceIdAtom);
    await setDoc(
      doc(getFirestore(), "games", gameId),
      demoData
        ? produce(demoData, (draft) => {
            draft.players.unshift({
              deviceId,
              name: "Dealer",
              balances: ["1000000000000000000000000", "0", "0", "0"],
              valuations: ["1", "0", "0", "0"],
            });
          })
        : {
            createdAt: serverTimestamp(),
            players: [
              {
                deviceId,
                name: "Dealer",
                balances: ["1000000000"],
                valuations: ["1"],
              },
            ],
            currencies: [
              { name: "US Dollars", symbol: "USD", totalSupply: "0" },
            ],
          },
    );
    return gameId;
  },
);

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

  if (!game) return undefined;

  const playerIndex = game.players.findIndex(
    (player) => player.deviceId === deviceId,
  );

  if (playerIndex === -1) return undefined;

  return {
    ...game.players[playerIndex],
    isDealer: playerIndex === 0,
  };
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

export interface PlayerOrDealer extends Player {
  isDealer?: boolean;
}

export const defined: <T>(innerAtom: Atom<T | undefined>) => Atom<T> = (
  innerAtom,
) =>
  atom((get: Getter) => {
    const value = get(innerAtom);
    if (value === undefined) {
      throw new Error("Atom value is undefined");
    }
    return value;
  });

export const dealerAtom = atom((get) => {
  const game = get(defined(maybeGameAtom));
  return { ...game.players[0], isDealer: true };
});

export const playersAtom = atom((get) => {
  const deviceId = get(deviceIdAtom);
  const game = get(defined(maybeGameAtom));

  return game.players.slice(1).map((player) => ({
    ...player,
    isCurrentPlayer: player.deviceId === deviceId,
    isDealer: false,
  }));
});

export const otherPlayersAtom = atom((get) => {
  const players = get(playersAtom);

  return players.filter((player) => !player.isCurrentPlayer);
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
  const players = [get(dealerAtom), ...get(playersAtom)];
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

import { bn } from "@/lib/bnMath";
import { eventConverter } from "@/lib/firebase/eventConverter";
import { gameConverter } from "@/lib/firebase/gameConverter";
import { getFirestore } from "@/lib/firebase/getFirestore";
import { portfolioValue } from "@/lib/game/portfolioValue";
import { generateId } from "@/lib/generateId";
import { generateUUID } from "@/lib/generateUUID";
import { relativePriceIndex } from "@/lib/indexWallets/relativePriceIndex";
import { Currency } from "@/types/Currency";
import { Event } from "@/types/Events";
import { DbGameData, GameData } from "@/types/GameData";
import { Player } from "@/types/Player";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
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

export const eventsObservableAtom = atom((get) => {
  const gameId = get(gameIdAtom);

  if (!gameId) {
    return new Observable<Event>((subscriber) => {
      subscriber.complete();
    });
  }

  return new Observable<Event>((subscriber) => {
    const unsubscribe = onSnapshot(
      query(
        collection(getFirestore(), "games", gameId, "events").withConverter(
          eventConverter,
        ),
        where("timestamp", ">", Timestamp.now()),
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;

          subscriber.next(change.doc.data());
        });
      },
    );

    return unsubscribe;
  });
});

// Workaround for Omit breaking Discriminated Unions
type OmitEventProp<T, K extends keyof Event> = T extends Event
  ? Omit<T, K>
  : never;

export const emitEventAtom = atom(
  null,
  async (get, _set, event: OmitEventProp<Event, "timestamp">) => {
    const gameId = get(gameIdAtom);

    Object.assign(event, { timestamp: serverTimestamp() });

    return (
      await addDoc(
        collection(getFirestore(), "games", gameId, "events").withConverter(
          eventConverter,
        ),
        event as Event,
      )
    ).id;
  },
);

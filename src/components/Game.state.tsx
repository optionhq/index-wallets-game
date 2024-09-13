import { INITIAL_RETAIL_PRICE } from "@/config";
import { bn } from "@/lib/bnMath";
import { eventConverter } from "@/lib/firebase/eventConverter";
import { gameConverter } from "@/lib/firebase/gameConverter";
import { getFirestore } from "@/lib/firebase/getFirestore";
import { generateUUID } from "@/lib/generateUUID";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { padArray } from "@/lib/utils/padArray";
import { cause, CauseSymbol } from "@/types/Cause";
import { Currency } from "@/types/Currency";
import { Event, ValuationsUpdatedEvent } from "@/types/Events";
import { GameData } from "@/types/GameData";
import { Player } from "@/types/Player";
import { WithId } from "@/types/utils";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { produce } from "immer";
import { Atom, atom, Getter } from "jotai";
import { atomEffect } from "jotai-effect";
import { withImmer } from "jotai-immer";
import { atomWithObservable, unwrap } from "jotai/utils";
import { BigNumber } from "mathjs";
import memoize from "memoize";
import { isDeepEqual, sortBy, times } from "remeda";
import { filter, Observable, scan, shareReplay, startWith } from "rxjs";

export const gameIdAtom = atom<string>("");

export const updateProvisionalValuationsEffect = atomEffect((get, set) => {
  const currentPlayer = get(maybeCurrentAgentAtom);
  if (currentPlayer) {
    set(playerProvisionalValuationsAtom, currentPlayer.valuations);
  }
});

export const updateProvisionalPriceEffect = atomEffect((get, set) => {
  const currentPlayer = get(maybeCurrentAgentAtom);
  if (currentPlayer) {
    set(playerProvisionalPriceAtom, currentPlayer.retailPrice);
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

  return new Observable<GameData | undefined | null>((subscriber) => {
    const unsubscribe = onSnapshot(
      doc(getFirestore(), "games", gameId).withConverter(gameConverter),
      (doc) => {
        subscriber.next(doc.exists() ? doc.data() : null);
      },
    );

    return unsubscribe;
  });
});

export const maybeGameAtom = unwrap(asyncGameAtom);

export interface GameConfig {
  id: string;
  causes: CauseSymbol[];
}

export const initializeGameAtom = atom(
  null,
  async (get, _set, config: GameConfig) => {
    const deviceId = get(deviceIdAtom);
    const currencies = [
      { name: "US Dollars", symbol: "USD", totalSupply: "0" },
      ...config.causes.map((causeSymbol) => ({
        ...cause[causeSymbol],
        totalSupply: "0",
      })),
    ];
    const gameData = {
      createdAt: serverTimestamp(),
      players: {
        [deviceId]: {
          index: 0,
          deviceId,
          name: "Dealer",
          balances: ["1000000000", ...times(currencies.length - 1, () => "0")],
          valuations: ["1", ...times(currencies.length - 1, () => "0")],
          character: "Dealer",
          retailPrice: INITIAL_RETAIL_PRICE,
        },
      },
      currencies,
    };
    await Promise.all([
      setDoc(doc(getFirestore(), "games", config.id), gameData),
      addDoc(
        collection(getFirestore(), "games", config.id, "history"),
        gameData,
      ),
    ]);
  },
);

export const gameAtom = withImmer(
  atom(
    (get) => get(defined(maybeGameAtom)),
    async (get, _set, gameData: GameData) => {
      const gameId = get(gameIdAtom);
      const currentGameData = get(defined(maybeGameAtom));

      await runTransaction(getFirestore(), async (transaction) => {
        const latestGameData = await transaction
          .get(
            doc(getFirestore(), "games", gameId).withConverter(gameConverter),
          )
          .then((doc) => doc.data());

        if (!latestGameData) {
          throw new Error("Game not found.");
        }

        if (!isDeepEqual(currentGameData, latestGameData)) {
          throw new Error(
            "Game state has changed since this transaction started.",
          );
        }

        transaction.set(
          doc(getFirestore(), "games", gameId).withConverter(gameConverter),
          gameData,
        );

        transaction.set(
          doc(
            collection(getFirestore(), "games", gameId, "history"),
          ).withConverter(gameConverter),
          { ...gameData, createdAt: serverTimestamp() },
        );
      });
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

export const maybeCurrentAgentAtom = atom((get) => {
  const deviceId = get(deviceIdAtom);
  const game = get(maybeGameAtom);

  if (!game) return undefined;

  const player = game.players[deviceId];

  if (!player) return undefined;

  return {
    ...player,
    isDealer: player.index === 0,
  };
});

export const playerAtom = memoize((playerId: string) =>
  atom((get) => {
    const agents = get(agentsAtom);

    const player = agents.find((player) => player.deviceId === playerId);

    if (!player) {
      throw new Error(`Player with ID ${playerId} not found in game.`);
    }

    return player;
  }),
);

export const currentAgentAtom = atom((get) => {
  const currentPlayer = get(maybeCurrentAgentAtom);

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

export const defined: <T>(innerAtom: Atom<T | undefined | null>) => Atom<T> = (
  innerAtom,
) =>
  atom((get: Getter) => {
    const value = get(innerAtom);
    if (value === undefined) {
      throw new Error("Atom value is undefined");
    }

    if (value === null) {
      throw new Error("Atom value is null");
    }
    return value;
  });

export const dealerAtom = atom((get) => {
  const agents = get(agentsAtom);

  return {
    ...agents[0],
    isDealer: true,
  };
});

export const agentsAtom = atom((get) => {
  const deviceId = get(deviceIdAtom);
  const game = get(defined(maybeGameAtom));

  return sortBy(Object.values(game.players), (p) => p.index).map((player) => ({
    ...player,
    isCurrentPlayer: player.deviceId === deviceId,
    isDealer: player.index === 0,
  }));
});

export const playersAtom = atom((get) => get(agentsAtom).slice(1));

export const otherPlayersAtom = atom((get) => {
  const players = get(playersAtom);

  return players.filter((player) => !player.isCurrentPlayer);
});

export const currenciesAtom = atom<Currency[]>((get) => {
  const game = get(defined(maybeGameAtom));
  return game.currencies;
});

export const causesAtom = atom<(Currency & { index: number })[]>((get) =>
  get(currenciesAtom)
    .filter((currency) => currency.symbol !== "USD")
    .map((c, i) => ({ ...c, index: i + 1 })),
);

export const playerProvisionalValuationsAtom = atom<BigNumber[]>([]);

export const playerProvisionalPriceAtom = atom<BigNumber>(
  bn(INITIAL_RETAIL_PRICE),
);

export const playerValuationsAtom = atom(
  (get) => get(currentAgentAtom).valuations,
  async (get, _set, newValuations: BigNumber[]) => {
    const gameId = get(gameIdAtom);
    const deviceId = get(deviceIdAtom);
    await updateDoc(doc(getFirestore(), "games", gameId), {
      [`players.${deviceId}.valuations`]: newValuations.map((v) =>
        v.toString(),
      ),
    });
  },
);

export const playerPriceAtom = atom(
  (get) => get(currentAgentAtom).retailPrice,
  async (get, _set, newPrice: BigNumber) => {
    const gameId = get(gameIdAtom);
    const deviceId = get(deviceIdAtom);
    await updateDoc(doc(getFirestore(), "games", gameId), {
      [`players.${deviceId}.retailPrice`]: newPrice.toString(),
    });
  },
);

export const activeTabAtom = atom<
  "wallet" | "buy" | "storefront" | "causes" | "market"
>("wallet");

// Charities only value USD
export const charityValuationsAtom = atom((get) => [
  bn(1),
  ...new Array(get(currenciesAtom).length - 1).fill(0).map(bn),
]);

export const playerPortfolioValueAtom = atom((get) => {
  const currentPlayer = get(currentAgentAtom);
  const networkValuations = get(networkValuationsAtom);
  return valueOf(currentPlayer.balances, networkValuations);
});

const gameEventsObservableAtom = memoize((gameId: string) =>
  atom(
    new Observable<WithId<Event>>((subscriber) => {
      const unsubscribe = onSnapshot(
        query(
          collection(getFirestore(), "games", gameId, "events").withConverter(
            eventConverter,
          ),
          orderBy("timestamp", "asc"),
        ),
        { includeMetadataChanges: true },
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "removed") return;

            // Ignore local changes (will be re-emitted on server write)
            if (change.doc.metadata.hasPendingWrites) return;

            subscriber.next({ ...change.doc.data(), id: change.doc.id });
          });
        },
      );

      return unsubscribe;
    }).pipe(shareReplay()),
  ),
);

export const eventsObservableAtom = atom((get) => {
  const gameId = get(gameIdAtom);

  if (!gameId) {
    return new Observable<WithId<Event>>((subscriber) => {
      subscriber.complete();
    });
  }

  return get(gameEventsObservableAtom(gameId));
});

// Workaround for Omit breaking Discriminated Unions
type OmitEventProp<T, K extends keyof Event> = T extends Event
  ? Omit<T, K>
  : never;

export const emitEventAtom = atom(
  null,
  async (get, _set, event: OmitEventProp<Event, "timestamp">) => {
    const gameId = get(gameIdAtom);

    return await emitEvent(gameId, event);
  },
);

export const emitEvent = async (
  gameId: string,
  event: OmitEventProp<Event, "timestamp">,
) => {
  Object.assign(event, { timestamp: serverTimestamp() });

  return (
    await addDoc(
      collection(getFirestore(), "games", gameId, "events").withConverter(
        eventConverter,
      ),
      event as Event,
    )
  ).id;
};

export const payeePaymentValueInputAtom = memoize(
  (_gameId: string, _vendorId?: string) => atom(`${INITIAL_RETAIL_PRICE}`),
  {
    cacheKey: ([vendorId, gameId]) =>
      `payee-payment-value-${gameId}-${vendorId}`,
  },
);

export const selectedPayeeAtom = atom<string | undefined>(undefined);

export const selectedCauseAtom = atom<
  (Currency & { index: number }) | undefined
>(undefined);

export const networkValuationsObservableAtom = atom((get) => {
  const currentAgent = get(currentAgentAtom);
  const otherPlayers = get(otherPlayersAtom);
  const playerWeight = 1 / otherPlayers.length;
  // Only USD is valued at first
  const initialValuations = [bn(1)];
  const isValuationsUpdatedEvent = (
    event: Event,
  ): event is ValuationsUpdatedEvent => event.type === "VALUATIONS_UPDATED";
  return get(eventsObservableAtom)
    .pipe(filter(isValuationsUpdatedEvent))
    .pipe(filter((event) => event.playerId !== currentAgent.deviceId)) //only interested in other players' valuations
    .pipe(
      scan(
        (valuations, event) =>
          produce(valuations, (draftValuations) => {
            for (let i = 0; i < event.newValuations.length; i++) {
              const oldNetworkValuation = draftValuations[i] ?? bn(0);
              const playerPreviousContribution =
                event.oldValuations[i].mul(playerWeight);
              const playerNewContribution =
                event.newValuations[i].mul(playerWeight);
              draftValuations[i] = oldNetworkValuation
                .sub(playerPreviousContribution)
                .add(playerNewContribution);
            }
            return draftValuations;
          }),
        initialValuations,
      ),
    )
    .pipe(startWith(initialValuations))
    .pipe(shareReplay());
});

const unormalizedNetworkValuationsAtom = unwrap(
  atomWithObservable((get) => get(networkValuationsObservableAtom)),
  () => [bn(1)],
);

export const networkValuationsAtom = atom((get) => {
  const unormalizedNetworkValuations = get(unormalizedNetworkValuationsAtom);
  const currencies = get(currenciesAtom);

  return padArray(unormalizedNetworkValuations, currencies.length, bn(0));
});

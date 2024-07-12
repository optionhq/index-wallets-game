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
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { produce } from "immer";
import { Atom, atom, Getter } from "jotai";
import { atomEffect } from "jotai-effect";
import { withImmer } from "jotai-immer";
import { atomWithObservable, unwrap } from "jotai/utils";
import { BigNumber } from "mathjs";
import memoize from "memoize";
import { Observable, shareReplay } from "rxjs";

export const gameIdAtom = atom<string>("");

export const updateProvisionalValuationsEffect = atomEffect((get, set) => {
  const currentPlayer = get(maybeCurrentAgentAtom);
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

export const initializeGameAtom = atom(null, async (get, _set) => {
  const gameId = generateId();
  const deviceId = get(deviceIdAtom);
  const gameData = {
    createdAt: serverTimestamp(),
    players: [
      {
        deviceId,
        name: "Dealer",
        balances: ["1000000000"],
        valuations: ["1"],
        character: "Dealer",
      },
    ],
    currencies: [{ name: "US Dollars", symbol: "USD", totalSupply: "0" }],
  };
  await Promise.all([
    setDoc(doc(getFirestore(), "games", gameId), gameData),
    addDoc(collection(getFirestore(), "games", gameId, "history"), gameData),
  ]);
  return gameId;
});

export const gameAtom = withImmer(
  atom(
    (get) => get(defined(maybeGameAtom)),
    async (get, _set, gameData: GameData) => {
      const gameId = get(gameIdAtom);

      await Promise.all([
        setDoc(
          doc(getFirestore(), "games", gameId).withConverter(gameConverter),
          gameData,
        ),

        addDoc(
          collection(getFirestore(), "games", gameId, "history").withConverter(
            gameConverter,
          ),
          { ...gameData, createdAt: serverTimestamp() },
        ),
      ]);
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

  const playerIndex = game.players.findIndex(
    (player) => player.deviceId === deviceId,
  );

  if (playerIndex === -1) return undefined;

  return {
    ...game.players[playerIndex],
    isDealer: playerIndex === 0,
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

export const agentsAtom = atom((get) => {
  const deviceId = get(deviceIdAtom);
  const game = get(defined(maybeGameAtom));

  return game.players.map((player, i) => ({
    ...player,
    isCurrentPlayer: player.deviceId === deviceId,
    isDealer: i === 0,
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

export const causesAtom = atom<Currency[]>((get) =>
  get(currenciesAtom).filter((currency) => currency.symbol !== "USD"),
);

export const playerProvisionalValuationsAtom = atom<BigNumber[]>([]);

export const playerValuationsAtom = atom(
  (get) => get(currentAgentAtom).valuations,
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

export const activeTabAtom = atom<
  "wallet" | "pay" | "valuations" | "causes" | "market"
>("wallet");

export const purchaseRelativePriceIndexesAtom = atom((get) => {
  const agents = [get(dealerAtom), ...get(playersAtom)];
  const currentAgent = get(currentAgentAtom);
  const provisionalValuations = get(playerProvisionalValuationsAtom);
  return agents.reduce(
    (indexes, player) => {
      return {
        ...indexes,
        [player.deviceId]: relativePriceIndex({
          buyerBalances: currentAgent.balances,
          vendorValuations:
            player.deviceId === currentAgent.deviceId
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
  const currentPlayer = get(currentAgentAtom);
  return portfolioValue(currentPlayer);
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

export const vendorPriceAtom = memoize(
  (_gameId: string, _vendorId?: string) => atom(""),
  { cacheKey: ([vendorId, gameId]) => `vendor-price-${gameId}-${vendorId}` },
);

export const selectedPayeeAtom = atom<string | undefined>(undefined);

// export const marketValuationsAtom = atomWithObservable((get) => {
//   const currencies = get(currenciesAtom);
//   const dealer = get(dealerAtom);
//   // Only USD is valued at first
//   const initialValuations = [
//     bn(1),
//     ...times(currencies.length - 1, () => bn(0)),
//   ];
//   const isPlayerEvent = (event: Event): event is PaymentMadeEvent =>
//     event.type === "PAYMENT_MADE" &&
//     event.from !== dealer.deviceId &&
//     event.to !== dealer.deviceId;
//   return get(eventsObservableAtom)
//     .pipe(filter(isPlayerEvent))
//     .pipe(map((event) => event.valuations))
//     .pipe(
//       // Start by filling the sliding window with initial valuations, so the first transactions aren't weighted disproportionately
//       startWith(...times(MARKET_VALUATIONS_WINDOW, () => initialValuations)),
//     )
//     .pipe(bufferCount(MARKET_VALUATIONS_WINDOW, 1))
//     .pipe(
//       map((latestTransactionValuations) =>
//         latestTransactionValuations.reduce(() => {}, [] as BigNumber[]),
//       ),
//     );
// });

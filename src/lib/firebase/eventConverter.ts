import { bn } from "@/lib/bnMath";
import { playerConverter } from "@/lib/firebase/playerConverter";
import { DbEvent, Event } from "@/types/Events";
import { FirestoreDataConverter } from "firebase/firestore";

export const eventConverter: FirestoreDataConverter<Event, DbEvent> = {
  fromFirestore: (snapshot, options) => {
    const event = snapshot.data(options) as DbEvent;

    switch (event.type) {
      case "PAYMENT_MADE":
        return {
          ...event,
          payment: event.payment.map((payment) => bn(payment)),
        };
      case "PLAYER_JOINED":
        return {
          ...event,
          ...playerConverter.fromFirestore(event),
        };

      case "VALUATIONS_UPDATED":
        return {
          ...event,
          valuations: event.valuations.map((valuation) => bn(valuation)),
        };
      case "DONATION_MADE":
        return {
          ...event,
          payment: bn(event.payment),
          tokensAcquired: bn(event.tokensAcquired),
        };
      case "GAME_CREATED":
        return event;
    }
  },
  toFirestore: (event: Event) => {
    switch (event.type) {
      case "PAYMENT_MADE":
        return {
          ...event,
          payment: event.payment.map((payment) => payment.toString()),
        };
      case "PLAYER_JOINED":
        return {
          ...event,
          ...playerConverter.toFirestore(event),
        };

      case "VALUATIONS_UPDATED":
        return {
          ...event,
          valuations: event.valuations.map((valuation) => valuation.toString()),
        };
      case "DONATION_MADE":
        return {
          ...event,
          payment: event.payment.toString(),
          tokensAcquired: event.tokensAcquired.toString(),
        };
      case "GAME_CREATED":
        return event;
    }
  },
};

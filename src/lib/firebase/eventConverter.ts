import { bn, bnStringify } from "@/lib/bnMath";
import { playerConverter } from "@/lib/firebase/playerConverter";
import { DbEvent, Event } from "@/types/Events";
import { FirestoreDataConverter } from "firebase/firestore";
import { BigNumber } from "mathjs";

export const eventConverter: FirestoreDataConverter<Event, DbEvent> = {
  fromFirestore: (snapshot, options) => {
    const event = snapshot.data(options) as DbEvent;

    switch (event.type) {
      case "PAYMENT_MADE":
        return {
          ...event,
          payment: event.payment.map<BigNumber>((value) => bn(value)),
          vendorValuations: event.vendorValuations.map<BigNumber>((value) =>
            bn(value),
          ),
          buyerValuations: event.buyerValuations.map<BigNumber>((value) =>
            bn(value),
          ),
        };
      case "PLAYER_JOINED":
        return {
          ...event,
          ...playerConverter.fromFirestore(event),
        };

      case "PRICE_UPDATED":
        return {
          ...event,
          oldPrice: bn(event.oldPrice),
          newPrice: bn(event.newPrice),
        };

      case "VALUATIONS_UPDATED":
        return {
          ...event,
          newValuations: event.newValuations.map<BigNumber>((value) =>
            bn(value),
          ),
          oldValuations: event.oldValuations.map<BigNumber>((value) =>
            bn(value),
          ),
        };
      case "DONATION_MADE":
        return {
          ...event,
          payment: event.payment.map<BigNumber>((value) => bn(value)),
          donorNetworkValuations: event.donorNetworkValuations.map<BigNumber>(
            (value) => bn(value),
          ),
          causeValuations: event.causeValuations.map<BigNumber>((value) =>
            bn(value),
          ),
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
          payment: event.payment.map(bnStringify),
          vendorValuations: event.vendorValuations.map(bnStringify),
          buyerValuations: event.buyerValuations.map(bnStringify),
        };
      case "PLAYER_JOINED":
        return {
          ...event,
          ...playerConverter.toFirestore(event),
        };

      case "PRICE_UPDATED":
        return {
          ...event,
          oldPrice: event.oldPrice.toString(),
          newPrice: event.newPrice.toString(),
        };

      case "VALUATIONS_UPDATED":
        return {
          ...event,
          newValuations: event.newValuations.map(bnStringify),
          oldValuations: event.oldValuations.map(bnStringify),
        };
      case "DONATION_MADE":
        return {
          ...event,
          payment: event.payment.map(bnStringify),
          tokensAcquired: event.tokensAcquired.toString(),
          donorNetworkValuations: event.donorNetworkValuations.map(bnStringify),
          causeValuations: event.causeValuations.map(bnStringify),
        };
      case "GAME_CREATED":
        return event;
    }
  },
};

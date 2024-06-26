import { CauseSymbol } from "@/types/Cause";
import { DbPlayer, Player } from "@/types/Player";
import { Timestamp } from "firebase/firestore";
import { BigNumber } from "mathjs";

export type PaymentMadeEvent = {
  type: "PAYMENT_MADE";
  timestamp: Timestamp;
  from: string;
  to: string;
  payment: BigNumber[];
};

export type PlayerJoinedEvent = {
  type: "PLAYER_JOINED";
  timestamp: Timestamp;
} & Player;

export type ValuationsUpdatedEvent = {
  type: "VALUATIONS_UPDATED";
  timestamp: Timestamp;
  playerId: string;
  valuations: BigNumber[];
};

export type DonationMadeEvent = {
  type: "DONATION_MADE";
  timestamp: Timestamp;
  playerId: string;
  cause: CauseSymbol;
  payment: BigNumber[];
  tokensAcquired: BigNumber;
};

export type GameCreatedEvent = {
  type: "GAME_CREATED";
  timestamp: Timestamp;
  dealerId: string;
};

export type Event =
  | PaymentMadeEvent
  | PlayerJoinedEvent
  | ValuationsUpdatedEvent
  | DonationMadeEvent
  | GameCreatedEvent;

export type PaymentMadeDbEvent = {
  type: "PAYMENT_MADE";
  timestamp: Timestamp;
  from: string;
  to: string;
  payment: string[];
};

export type PlayerJoinedDbEvent = {
  type: "PLAYER_JOINED";
  timestamp: Timestamp;
} & DbPlayer;

export type ValuationsUpdatedDbEvent = {
  type: "VALUATIONS_UPDATED";
  timestamp: Timestamp;
  playerId: string;
  valuations: string[];
};

export type DonationMadeDbEvent = {
  type: "DONATION_MADE";
  timestamp: Timestamp;
  playerId: string;
  cause: CauseSymbol;
  payment: string[];
  tokensAcquired: string;
};

export type GameCreatedDbEvent = {
  type: "GAME_CREATED";
  timestamp: Timestamp;
  dealerId: string;
};

export type DbEvent =
  | PaymentMadeDbEvent
  | PlayerJoinedDbEvent
  | ValuationsUpdatedDbEvent
  | DonationMadeDbEvent
  | GameCreatedDbEvent;

export interface DbEventOf {
  PaymentMadeEvent: PaymentMadeDbEvent;
  PlayerJoinedEvent: PlayerJoinedDbEvent;
  ValuationsUpdatedEvent: ValuationsUpdatedDbEvent;
  DonationMadeEvent: DonationMadeDbEvent;
  GameCreatedEvent: GameCreatedDbEvent;
}

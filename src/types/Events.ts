import { CauseSymbol } from "@/types/Cause";
import { DbPlayer, Player } from "@/types/Player";
import { Timestamp } from "firebase/firestore";
import { BigNumber } from "mathjs";

export type PaymentMadeEvent = {
  type: "PAYMENT_MADE";
  timestamp: Timestamp;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  payment: BigNumber[];
  vendorValuations: BigNumber[];
  buyerValuations: BigNumber[];
};

export type PlayerJoinedEvent = {
  type: "PLAYER_JOINED";
  timestamp: Timestamp;
} & Player;

export type PriceUpdatedEvent = {
  playerId: string;
  playerName: string;
  type: "PRICE_UPDATED";
  timestamp: Timestamp;
  oldPrice: BigNumber;
  newPrice: BigNumber;
};

export type ValuationsUpdatedEvent = {
  type: "VALUATIONS_UPDATED";
  timestamp: Timestamp;
  playerId: string;
  playerName: string;
  oldValuations: BigNumber[];
  newValuations: BigNumber[];
};

export type DonationMadeEvent = {
  type: "DONATION_MADE";
  timestamp: Timestamp;
  playerId: string;
  playerName: string;
  cause: CauseSymbol;
  payment: BigNumber[];
  donorValuations: BigNumber[];
  causeValuations: BigNumber[];
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
  | PriceUpdatedEvent
  | ValuationsUpdatedEvent
  | DonationMadeEvent
  | GameCreatedEvent;

export type PaymentMadeDbEvent = {
  type: "PAYMENT_MADE";
  timestamp: Timestamp;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  payment: string[];
  vendorValuations: string[];
  buyerValuations: string[];
};

export type PlayerJoinedDbEvent = {
  type: "PLAYER_JOINED";
  timestamp: Timestamp;
} & DbPlayer;

export type PriceUpdatedDbEvent = {
  type: "PRICE_UPDATED";
  timestamp: Timestamp;
  playerId: string;
  playerName: string;
  oldPrice: string;
  newPrice: string;
};

export type ValuationsUpdatedDbEvent = {
  type: "VALUATIONS_UPDATED";
  timestamp: Timestamp;
  playerId: string;
  playerName: string;
  newValuations: string[];
  oldValuations: string[];
};

export type DonationMadeDbEvent = {
  type: "DONATION_MADE";
  timestamp: Timestamp;
  playerId: string;
  playerName: string;
  cause: CauseSymbol;
  payment: string[];
  donorValuations: string[];
  causeValuations: string[];
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
  | PriceUpdatedDbEvent
  | ValuationsUpdatedDbEvent
  | DonationMadeDbEvent
  | GameCreatedDbEvent;

export interface DbEventOf {
  PaymentMadeEvent: PaymentMadeDbEvent;
  PlayerJoinedEvent: PlayerJoinedDbEvent;
  PriceUpdatedEvent: PriceUpdatedDbEvent;
  ValuationsUpdatedEvent: ValuationsUpdatedDbEvent;
  DonationMadeEvent: DonationMadeDbEvent;
  GameCreatedEvent: GameCreatedDbEvent;
}

import {
  currentPlayerAtom,
  eventsObservableAtom,
  gameAtom,
} from "@/components/Game.state";
import { formatValue } from "@/lib/game/formatValue";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { PaymentMadeEvent } from "@/types/Events";
import { GameData } from "@/types/GameData";
import { Player } from "@/types/Player";
import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export const useNotifications = () => {
  const eventsObservable = useAtomValue(eventsObservableAtom);
  const getCurrentPlayer = useAtomCallback(
    useCallback((get) => get(currentPlayerAtom), []),
  );
  const getGame = useAtomCallback(useCallback((get) => get(gameAtom), []));

  useEffect(() => {
    const subscription = eventsObservable.subscribe((event) => {
      switch (event.type) {
        case "PAYMENT_MADE":
          handlePayments(event, getCurrentPlayer(), getGame());
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventsObservable, getCurrentPlayer, getGame]);
};

const handlePayments = (
  event: PaymentMadeEvent,
  player: Player,
  game: GameData,
) => {
  if (event.from === player.deviceId) {
    toast.success(
      `Paid ${formatValue(valueOf(event.payment, player.valuations), { withDollarSign: true })} to ${game.players.find((player) => player.deviceId === event.to)?.name}`,
    );
  }

  if (event.to === player.deviceId) {
    toast.success(
      `Received ${formatValue(valueOf(event.payment, player.valuations), { withDollarSign: true })} from ${game.players.find((player) => player.deviceId === event.from)?.name}`,
    );
  }
};

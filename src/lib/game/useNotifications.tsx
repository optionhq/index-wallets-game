import { CharacterBadge } from "@/components/CharacterBadge";
import {
  currentAgentAtom,
  eventsObservableAtom,
  gameAtom,
} from "@/components/Game.state";
import { formatValue } from "@/lib/game/formatValue";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { Timestamp } from "firebase/firestore";
import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect } from "react";
import { filter } from "rxjs";
import { toast } from "sonner";

export const useNotifications = () => {
  const eventsObservable = useAtomValue(eventsObservableAtom);
  const getCurrentPlayer = useAtomCallback(
    useCallback((get) => get(currentAgentAtom), []),
  );
  const getGame = useAtomCallback(useCallback((get) => get(gameAtom), []));

  useEffect(() => {
    const subscribeTimestamp = Timestamp.now();
    const subscription = eventsObservable
      .pipe(filter((event) => event.timestamp >= subscribeTimestamp))
      .subscribe((event) => {
        const currentPlayer = getCurrentPlayer();
        const game = getGame();
        switch (event.type) {
          case "PAYMENT_MADE":
            if (event.from === currentPlayer.deviceId) {
              toast.success(
                <>
                  Paid{" "}
                  {formatValue(
                    valueOf(event.payment, currentPlayer.valuations),
                    {
                      withIndexSign: true,
                    },
                  )}{" "}
                  to{" "}
                  {
                    game.players.find((player) => player.deviceId === event.to)
                      ?.name
                  }
                </>,
              );
            }

            if (event.to === currentPlayer.deviceId) {
              toast(
                <>
                  Received{" "}
                  {formatValue(
                    valueOf(event.payment, currentPlayer.valuations),
                    {
                      withIndexSign: true,
                    },
                  )}{" "}
                  from{" "}
                  {
                    game.players.find(
                      (player) => player.deviceId === event.from,
                    )?.name
                  }
                </>,
              );
            }
            break;
          case "PLAYER_JOINED":
            if (event.deviceId !== currentPlayer.deviceId) {
              toast(
                <div className="flex gap-2 items-center">
                  <CharacterBadge character={event.character} />
                  <p>
                    <strong>{event.name}</strong> joined the game
                  </p>
                </div>,
              );
            }
            break;
          case "DONATION_MADE":
            if (event.playerId === currentPlayer.deviceId) {
              toast.success(
                `Donated $${event.payment[0].toFixed(2)} to ${event.cause}`,
              );
            }

            if (event.playerId !== currentPlayer.deviceId) {
              toast(
                `${game.players.find((p) => p.deviceId === event.playerId)?.name} donated $${event.payment[0].toFixed(2)} to ${event.cause}`,
              );
            }
            break;
          case "VALUATIONS_UPDATED":
            if (event.playerId === currentPlayer.deviceId) {
              toast.success(`Valuations updated`);
            }

            if (event.playerId !== currentPlayer.deviceId) {
              toast(
                `${game.players.find((p) => p.deviceId === event.playerId)?.name} updated their valuations`,
              );
            }
            break;
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventsObservable, getCurrentPlayer, getGame]);
};

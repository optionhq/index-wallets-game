import {
  agentsAtom,
  currenciesAtom,
  dealerAtom,
  eventsObservableAtom,
} from "@/components/Game.state";
import { DONATION_REWARD, INITIAL_USD_BALANCE, tokenColor } from "@/config";
import { CurrencySymbol } from "@/types/Currency";
import { Event } from "@/types/Events";
import { useAtomValue } from "jotai";
import { atomWithObservable } from "jotai/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { scan } from "rxjs";

const dataAtom = atomWithObservable((get) => {
  const dealer = get(dealerAtom);
  const currencies = get(currenciesAtom);

  return get(eventsObservableAtom).pipe(
    scan(
      (previousData, event) => {
        const latestPoint = previousData[previousData.length - 1];
        switch (event.type) {
          case "GAME_CREATED":
            return [
              {
                timestamp: event.timestamp.toMillis(),
                ...event.currencies.reduce(
                  (currencies, currency) => ({
                    ...currencies,
                    [currency.symbol]: 0,
                  }),
                  {} as Partial<Record<CurrencySymbol, number>>,
                ),
                event,
                index: 0,
              },
            ];
          case "PLAYER_JOINED":
            return [
              ...previousData,
              {
                ...latestPoint,
                timestamp: event.timestamp.toMillis(),
                USD: latestPoint.USD! + INITIAL_USD_BALANCE,
                event,
                index: latestPoint.index + 1,
              },
            ];
          case "DONATION_MADE":
            return [
              ...previousData,
              {
                ...latestPoint,
                timestamp: event.timestamp.toMillis(),

                // Remove the donation payment from token supplies
                // ...event.payment.reduce(
                //   (balances, amount, index) => ({
                //     ...balances,
                //     [currencies[index].symbol]:
                //       (latestPoint[currencies[index].symbol] ?? 0) -
                //       amount.toNumber() +
                //       (currencies[index].symbol === event.cause
                //         ? event.tokensAcquired.toNumber()
                //         : 0),
                //   }),
                //   {} as Partial<Record<CurrencySymbol, number>>,
                // ),
                [event.cause]:
                  (latestPoint[event.cause] ?? 0) + DONATION_REWARD,
                event,
                index: latestPoint.index + 1,
              },
            ];
          case "PAYMENT_MADE":
            // payments from the dealer increase token supplies
            if (event.from === dealer.deviceId) {
              return [
                ...previousData,
                {
                  ...latestPoint,
                  timestamp: event.timestamp.toMillis(),
                  ...event.payment.reduce(
                    (balances, amount, index) => ({
                      ...balances,
                      [currencies[index].symbol]:
                        (latestPoint[currencies[index].symbol] ?? 0) +
                        amount.toNumber(),
                    }),
                    {} as Partial<Record<CurrencySymbol, number>>,
                  ),
                  event,
                  index: latestPoint.index + 1,
                },
              ];
            }

            // Payments to the dealer reduce token supplies
            // if (event.to === dealer.deviceId) {
            //   return [
            //     ...previousData,
            //     {
            //       ...latestPoint,
            //       timestamp: event.timestamp.toMillis(),
            //       ...event.payment.reduce(
            //         (balances, amount, index) => ({
            //           ...balances,
            //           [currencies[index].symbol]:
            //             (latestPoint[currencies[index].symbol] ?? 0) -
            //             amount.toNumber(),
            //         }),
            //         {} as Partial<Record<CurrencySymbol, number>>,
            //       ),
            //       event,
            //       index: latestPoint.index + 1,
            //     },
            //   ];
            // }
            return previousData;
          case "VALUATIONS_UPDATED":
          case "PRICE_UPDATED":
            return previousData;
        }
      },
      [] as ({
        timestamp: number;
        event: Event;
        index: number;
      } & Partial<Record<CurrencySymbol, number>>)[],
    ),
  );
});

export const TokenSuppliesChart = () => {
  const data = useAtomValue(dataAtom);
  const currencies = useAtomValue(currenciesAtom);
  const players = useAtomValue(agentsAtom);

  console.log(data);

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          type="number"
          scale="sequential"
          tick={false}
          interval={0}
        />
        <YAxis width={30} className="text-xs" />
        <Tooltip
          allowEscapeViewBox={{ x: false, y: true }}
          position={{ y: 0 }}
          labelFormatter={(_timestamp, points) => {
            const event = points?.[0]?.payload.event as Event | undefined;
            if (!event) return "";
            switch (event.type) {
              case "GAME_CREATED":
                return "Game created";
              case "PLAYER_JOINED":
                return `${event.name} joined the game`;
              case "DONATION_MADE":
                return `${players.find((player) => player.deviceId === event.playerId)?.name} donated to ${event.cause}`;
              case "PAYMENT_MADE":
                return `${players.find((player) => player.deviceId === event.from)?.name} paid ${players.find((player) => player.deviceId === event.to)?.name}`;
            }
          }}
          labelClassName="font-bold pb-2"
          wrapperClassName="text-xs rounded-md shadow-sm !bg-background/85 "
          itemStyle={{ padding: 0 }}
          formatter={(value: number) => value.toFixed(2)}
        />
        {currencies.map((currency) => (
          <Area
            activeDot={false}
            type="bump"
            key={currency.symbol}
            dataKey={currency.symbol}
            stackId="1"
            stroke={tokenColor[currency.symbol]}
            fill={tokenColor[currency.symbol]}
            fillOpacity={1}
            connectNulls
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

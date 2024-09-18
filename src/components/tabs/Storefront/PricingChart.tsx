import { CharacterIcon } from "@/components/CharacterIcon";
import {
  currentAgentAtom,
  networkValuationsAtom,
  otherPlayersAtom,
  playerProvisionalPriceAtom,
  playerProvisionalValuationsAtom,
} from "@/components/Game.state";
import { characterIcon, INITIAL_RETAIL_PRICE } from "@/config";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { price } from "@/lib/indexWallets/price";
import { formatOrdinal } from "@/lib/utils/formatOrdinal";
import { useAtomValue } from "jotai";
import { BigNumber } from "mathjs";
import { FC } from "react";
import {
  Bar,
  Cell,
  ComposedChart,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  ResponsiveContainerProps,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { range, sortBy } from "remeda";

export const PricingChart: FC<ResponsiveContainerProps> = ({
  children,
  className,
}) => {
  const otherPlayers = useAtomValue(otherPlayersAtom);
  const currentPlayer = useAtomValue(currentAgentAtom);
  const currentPlayerValuations = useAtomValue(playerProvisionalValuationsAtom);
  const currentPlayerNetworkValuations = useAtomValue(networkValuationsAtom);
  const currentPlayerPrice = useAtomValue(playerProvisionalPriceAtom);

  const playersValuationsSum = [
    ...otherPlayers.map((p) => p.valuations),
    currentPlayerValuations,
  ].reduce(
    (networkValuationsSum, playerValuations) =>
      playerValuations.map((playerValuation, i) =>
        (networkValuationsSum[i] ?? bn(0)).add(playerValuation),
      ),
    [] as BigNumber[],
  );

  const data = otherPlayers.flatMap((buyer) => {
    const buyerNetworkValuations = playersValuationsSum.map(
      (valuationsSum, i) =>
        valuationsSum.sub(buyer.valuations[i]).div(otherPlayers.length),
    );

    const myPriceToThem = price({
      buyerBalances: buyer.balances,
      vendorPrice: currentPlayerPrice,
      vendorValuations: currentPlayerValuations,
      viewerValuations: buyerNetworkValuations,
    });

    const priceToMe = price({
      buyerBalances: buyer.balances,
      vendorPrice: currentPlayerPrice,
      vendorValuations: currentPlayerValuations,
      viewerValuations: currentPlayerNetworkValuations,
    });

    const pricesFromCompetitors = otherPlayers
      .filter((otherPlayer) => otherPlayer.deviceId !== buyer.deviceId)
      .map((competitor) => ({
        playerId: competitor.deviceId,
        playerName: competitor.name,
        playerCharacter: competitor.character,
        isViewer: false,
        price: price({
          buyerBalances: buyer.balances,
          vendorPrice: bn(INITIAL_RETAIL_PRICE),
          vendorValuations: competitor.valuations,
          viewerValuations: buyerNetworkValuations,
        }).toNumber(),
      }));

    const sortedPricesToThem = sortBy(
      [
        {
          playerId: currentPlayer.deviceId,
          playerName: "You",
          playerCharacter: currentPlayer.character,
          isViewer: true,
          price: myPriceToThem.toNumber(),
        },
        ...pricesFromCompetitors,
      ],
      (p) => p.price,
    );

    const playerRanks = sortedPricesToThem.reduce(
      (playerIndexes, player, i) => ({
        ...playerIndexes,
        [player.playerId]: i + 1,
      }),
      {} as Record<string, number>,
    );

    const playersData = sortedPricesToThem.reduce(
      (playersData, playerData, i) => ({
        ...playersData,
        [i + 1]: playerData,
      }),
      {} as Record<number, (typeof sortedPricesToThem)[number]>,
    );
    const rankedPrices = sortedPricesToThem.reduce(
      (prices, p, i) => ({ ...prices, [i + 1]: p.price }),
      {} as Record<number, number>,
    );

    return {
      name: buyer.name,
      character: buyer.character,
      playerRanks,
      playersData,
      ...rankedPrices,
      priceToMe: priceToMe.toNumber(),
    };
  });

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      <h2 className="text-xs leading-none text-muted-foreground">
        Prices from each perspective
      </h2>
      <ResponsiveContainer width="100%" height={100}>
        <ComposedChart
          data={data}
          stackOffset="sign"
          barGap={1}
          barSize={2}
          margin={{ top: 0, right: 0, left: 0 }}
        >
          <XAxis
            height={26}
            interval={0}
            dataKey="name"
            tickLine={false}
            tick={({ x, y, index }) => {
              const RADIUS = 14;
              const PADDING = 4;
              return (
                <svg
                  x={x - RADIUS}
                  y={y - 6}
                  width={2 * RADIUS}
                  height={2 * RADIUS}
                  viewBox={`0 0 ${2 * RADIUS} ${2 * RADIUS}`}
                >
                  <image
                    href={characterIcon[data[index].character]}
                    opacity={0.8}
                    x={PADDING}
                    y={PADDING}
                    width={2 * (RADIUS - PADDING)}
                    height={2 * (RADIUS - PADDING)}
                  />
                </svg>
              );
            }}
          ></XAxis>
          <YAxis
            ticks={[0, 10, 20]}
            fontSize={10}
            tickFormatter={(value) => `ⱡ${value}`}
            domain={[0, 20]}
            allowDataOverflow
            width={30}
          />

          {/* @ts-expect-error Returning element on formatter */}
          <Tooltip
            // allowEscapeViewBox={{ y: true }}
            // position={{ y: -270 }}
            labelClassName="text-wrap text-center !mb-4"
            labelFormatter={(playerName: string, data) => {
              const character = data.find(
                (entry) => entry.payload.name === playerName,
              )?.payload.character;

              return (
                <>
                  <span className="text-muted-foreground">
                    Prices from the perspective of{" "}
                  </span>
                  <strong className="mt-2 flex w-full items-center justify-center gap-1 whitespace-nowrap">
                    <CharacterIcon
                      character={character}
                      className="inline size-6 border p-0.5"
                    />{" "}
                    {playerName}
                  </strong>
                </>
              );
            }}
            formatter={(value: number, _name, entry, i) => {
              const playerData = entry.payload.playersData[entry.dataKey!];
              if (playerData)
                return (
                  <>
                    ⱡ{value.toFixed(1)} from{" "}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 align-text-top",
                        playerData.isViewer &&
                          (i === 0 ? "text-[yellowgreen]" : "text-primary"),
                        playerData.isViewer && "font-bold",
                      )}
                    >
                      <CharacterIcon
                        character={playerData.playerCharacter}
                        className="inline size-4 border-none p-0 opacity-75"
                      />
                      {playerData.playerName}
                    </span>
                  </>
                );
              return `ⱡ${value.toFixed(1)}`;
            }}
            wrapperClassName="flex flex-col text-xs min-w-60 items-center !max-w-64 rounded-md shadow-md  border !p-6"
            wrapperStyle={{
              margin: "0 auto",
              inset: "auto 0 calc(100% + 40px) 0",
              width: "fit-content",
              position: "absolute",
              transform: "none",
            }}
            itemStyle={{ padding: 0 }}
            offset={0}
          />

          <ReferenceLine
            key={"base-price"}
            y={currentPlayerPrice.toNumber()}
            stroke="hsl(47.9 95.8% 53.1%/0.5)"
            strokeDasharray={3}
          />

          <Scatter
            key="price-to-me"
            // @ts-expect-error Props typed as unknown on the lib
            shape={({
              cx,
              cy,
              yAxis,
            }: {
              cx: number;
              cy: number;
              yAxis: { scale: (value: number) => number };
              priceToMe: number;
            }) => {
              const basePriceY = yAxis.scale(currentPlayerPrice.toNumber());

              const diff = basePriceY - cy;

              const height = Math.abs(diff);

              const barWidth = 23;
              return (
                <>
                  <Rectangle
                    width={barWidth}
                    x={cx - barWidth / 2}
                    height={1}
                    y={cy}
                    className={cn(diff >= 0 ? "fill-blue-500" : "fill-red-500")}
                  />
                  <Rectangle
                    width={barWidth}
                    x={cx - barWidth / 2}
                    height={Math.max(1, height)}
                    y={diff >= 0 ? cy : cy - height}
                    className={cn(
                      diff >= 0
                        ? "border-blue-500 border-t-border fill-blue-500/10"
                        : "border-b-[1px] border-red-500 fill-red-500/10",
                    )}
                  />
                </>
              );
            }}
            name="You receive"
            dataKey="priceToMe"
          />

          {range(1, otherPlayers.length + 1).map((rank) => (
            <Bar
              key={`rank-${rank}-bar`}
              name={rank === 1 ? "Best" : `${formatOrdinal(rank)}`}
              dataKey={rank}
              minPointSize={3}
            >
              {data.map((entry, cellIndex) => (
                <Cell
                  key={`cell-${cellIndex}`}
                  className={cn(
                    entry.playerRanks[currentPlayer.deviceId] === rank
                      ? rank === 1
                        ? "fill-green-500"
                        : "fill-primary"
                      : "fill-muted-foreground/50",
                  )}
                />
              ))}
            </Bar>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      {children}
    </div>
  );
};

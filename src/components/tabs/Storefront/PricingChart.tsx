import { CharacterIcon } from "@/components/CharacterIcon";
import {
  currentAgentAtom,
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
  BarChart,
  Cell,
  ResponsiveContainer,
  ResponsiveContainerProps,
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

    const pricesFromCompetitors = otherPlayers
      .filter((otherPlayer) => otherPlayer.deviceId !== buyer.deviceId)
      .map((competitor) => ({
        playerId: competitor.deviceId,
        playerName: competitor.name,
        playerCharacter: competitor.character,
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
    };
  });

  return (
    <div className={cn("relative flex flex-col items-center gap-2", className)}>
      <h2 className="text-xs text-muted-foreground leading-none">
        Prices from each perspective
      </h2>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={data}
          stackOffset="sign"
          barGap={1}
          barSize={2}
          margin={{ top: 0, right: 0, left: 0 }}
        >
          {/* <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            horizontal={false}
          /> */}
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
                  {/* <text
                  textAnchor="middle"
                  x="50%"
                  // fill={characterColor[data[index].character]}
                  fill="gray"
                  fontSize={9}
                  y={2 * RADIUS + 10}
                >
                  {formatValue(data[index].priceToThem, {
                    withIndexSign: true,
                    decimalPlaces: 1,
                  })}
                </text> */}
                  {/* {data[index].isBestPrice && (
                  <text
                    textAnchor="middle"
                    x="50%"
                    fill="green"
                    fontSize={6}
                    y={2 * RADIUS + 16}
                  >
                    BEST
                  </text>
                )} */}
                </svg>
              );
            }}
          ></XAxis>
          <YAxis
            ticks={[0, 10, 20]}
            domain={[0, 20]}
            allowDataOverflow
            width={30}
          />

          {/* @ts-expect-error Returning element on formatter */}
          <Tooltip
            allowEscapeViewBox={{ y: true }}
            position={{ y: -270 }}
            labelClassName="text-wrap  text-center !mb-4"
            labelFormatter={(playerName: string, data) => {
              const character = data.find(
                (entry) => entry.payload.name === playerName,
              )?.payload.character;

              return (
                <>
                  <span className="text-muted-foreground">
                    Prices from the perspective of{" "}
                  </span>
                  <strong className="flex gap-1 mt-2 whitespace-nowrap w-full justify-center items-center">
                    <CharacterIcon
                      character={character}
                      className="inline p-0.5 size-6 border"
                    />{" "}
                    {playerName}
                  </strong>
                </>
              );
            }}
            formatter={(value: number, _name, entry, i) => {
              const playerData = entry.payload.playersData[i + 1];
              return (
                <>
                  ⱡ{value.toFixed(1)} from{" "}
                  <span
                    className={cn(
                      "inline-flex align-text-top gap-1 items-center",
                      playerData.isViewer &&
                        (i === 0 ? "text-[yellowgreen]" : "text-primary"),
                      playerData.isViewer && "font-bold",
                    )}
                  >
                    <CharacterIcon
                      character={playerData.playerCharacter}
                      className="inline p-0 border-none size-4 opacity-75"
                    />
                    {playerData.playerName}
                  </span>
                </>
              );
            }}
            wrapperClassName="text-xs !max-w-50 rounded-md shadow-sm opacity-95 bg-background border !p-6"
            itemStyle={{ padding: 1 }}
            offset={0}
            cursor={{
              fill: "hsl(47.9 0% 73.1% / 0.1)",
            }}
          />
          {/* <ReferenceArea
          y1={1}
          y2={-10000}
          fill="gray"
          fillOpacity={0.1}
          ifOverflow="hidden"
        /> */}
          {range(1, otherPlayers.length + 1).map((rank) => (
            <Bar
              key={`rank-${rank}-bar`}
              name={
                rank === 1
                  ? "Best"
                  : rank === otherPlayers.length
                    ? "Worst"
                    : `${formatOrdinal(rank)}`
              }
              dataKey={rank}
              minPointSize={3}
              // fill={characterColor[player.character]}
            >
              {data.map((entry, cellIndex) => (
                <Cell
                  key={`cell-${cellIndex}`}
                  fill={
                    entry.playerRanks[currentPlayer.deviceId] === rank
                      ? rank === 1
                        ? "yellowgreen"
                        : "hsl(47.9 95.8% 53.1%)"
                      : "hsl(0 0% 90%)"
                  }
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      {children}
    </div>
  );
};

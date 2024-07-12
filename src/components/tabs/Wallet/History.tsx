import { BalancesDonut } from "@/components/BalancesDonut";
import { CharacterBadge } from "@/components/CharacterBadge";
import {
  currenciesAtom,
  currentAgentAtom,
  eventsObservableAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/game/formatValue";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { cause } from "@/types/Cause";
import { Event } from "@/types/Events";
import { WithId } from "@/types/utils";
import { useAtomValue } from "jotai";
import { atomWithObservable, unwrap } from "jotai/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  HandHeartIcon,
  Settings2Icon,
  UserRoundPlusIcon,
} from "lucide-react";
import { sum } from "mathjs";
import { filter, scan } from "rxjs";

export const historyAtom = unwrap(
  atomWithObservable((get) => {
    const currentAgent = get(currentAgentAtom);
    return get(eventsObservableAtom)
      .pipe(
        filter((event) =>
          currentAgent.isDealer
            ? true
            : (event.type === "PAYMENT_MADE" &&
                (event.from === currentAgent.deviceId ||
                  event.to === currentAgent.deviceId)) ||
              (event.type === "DONATION_MADE" &&
                event.playerId === currentAgent.deviceId) ||
              (event.type === "VALUATIONS_UPDATED" &&
                event.playerId === currentAgent.deviceId),
        ),
      )
      .pipe(
        scan((history, event) => [event, ...history], [] as WithId<Event>[]),
      );
  }),
);

export const History = () => {
  const currencies = useAtomValue(currenciesAtom);
  const currentAgent = useAtomValue(currentAgentAtom);
  const history = useAtomValue(historyAtom);
  return (
    <Accordion type="multiple">
      {(history ?? ([] as WithId<Event>[]))
        .map((event) => {
          switch (event.type) {
            case "PAYMENT_MADE": {
              const isRecipient = event.to === currentAgent.deviceId;
              const isSender = event.from === currentAgent.deviceId;
              const recipientValues = event.vendorValuations.map(
                (valuation, i) => valuation.mul(event.payment[i]),
              );
              const senderValues = event.buyerValuations.map((valuation, i) =>
                valuation.mul(event.payment[i]),
              );
              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger>
                    <BanknoteIcon
                      className={cn(
                        "p-2 size-10 rounded-full overflow-visible bg-muted",
                        isRecipient && "bg-green-100",
                      )}
                    />
                    <div className="flex flex-col flex-grow items-start">
                      <strong className="text-muted-foreground">
                        Payment {isRecipient && "received"}
                        {isSender && "sent"}
                      </strong>
                      <div className="flex gap-1 items-center mt-2">
                        <p>
                          {formatValue(
                            valueOf(event.payment, currentAgent.valuations),
                            {
                              withIndexSign: true,
                            },
                          )}
                        </p>
                        <BalancesDonut balances={event.payment} className="p-1">
                          <div className="size-2 bg-background rounded-full" />{" "}
                        </BalancesDonut>
                      </div>
                      <p className="text-sm">
                        {!isSender &&
                          (currentAgent.isDealer || isRecipient) && (
                            <>
                              from <strong>{event.fromName}</strong>
                            </>
                          )}{" "}
                        {(currentAgent.isDealer || isSender) &&
                          !isRecipient && (
                            <>
                              to <strong>{event.toName}</strong>
                            </>
                          )}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table className="gap-4 text-xs text-center">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="align-middle h-8 row-span-2">
                            Token
                          </TableHead>
                          <TableHead className="align-middle h-8 row-span-2">
                            Amount
                          </TableHead>
                          <TableHead className="text-right align-middle h-8">
                            Value to {isRecipient ? "you" : event.toName}
                          </TableHead>
                          <TableHead className="text-right align-middle h-8">
                            Value to {isSender ? "you" : event.fromName}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.payment.map((amount, i) => {
                          const symbol = currencies[i].symbol;
                          return (
                            <TableRow key={symbol}>
                              <TableCell className="flex items-center gap-1.5 font-medium">
                                <TokenBadge
                                  withoutIcon
                                  token={symbol}
                                  className={`size-1.5 rounded-none rotate-45`}
                                />
                                {symbol}
                              </TableCell>
                              <TableCell>{formatValue(amount)}</TableCell>
                              <TableCell
                                className={cn(
                                  "text-right",
                                  recipientValues[i].isNegative() &&
                                    "text-destructive",
                                  recipientValues[i].isZero() &&
                                    "text-muted-foreground/70",
                                )}
                              >
                                {formatValue(recipientValues[i], {
                                  withIndexSign: true,
                                })}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "text-right",
                                  senderValues[i].isNegative() &&
                                    "text-destructive",
                                  senderValues[i].isZero() &&
                                    "text-muted-foreground/70",
                                )}
                              >
                                {formatValue(senderValues[i], {
                                  withIndexSign: true,
                                })}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="font-bold text-right"
                          >
                            Total
                          </TableCell>
                          <TableCell className={cn("text-right")}>
                            {formatValue(sum(recipientValues), {
                              withIndexSign: true,
                            })}
                          </TableCell>
                          <TableCell className={cn("text-right")}>
                            {formatValue(sum(senderValues), {
                              withIndexSign: true,
                            })}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            case "DONATION_MADE": {
              const isDonor = event.playerId === currentAgent.deviceId;
              const donorValues = event.payment.map((amount, i) =>
                event.donorValuations[i].mul(amount),
              );
              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger>
                    <HandHeartIcon className="p-2 size-10 rounded-full bg-muted" />
                    <div className="flex flex-col flex-grow items-start">
                      <strong className="text-muted-foreground">
                        Donation
                      </strong>

                      <div className="flex gap-1 items-center mt-2">
                        <p>
                          {formatValue(sum(donorValues), {
                            withIndexSign: true,
                          })}
                        </p>
                        <BalancesDonut balances={event.payment} className="p-1">
                          <div className="size-2 bg-background rounded-full" />{" "}
                        </BalancesDonut>
                      </div>
                      <span className="text-left text-sm">
                        {!isDonor && (
                          <>
                            <strong>{event.playerName}</strong>{" "}
                          </>
                        )}
                        to {cause[event.cause].name}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table className="gap-4 text-xs text-center">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="align-middle h-8 row-span-2">
                            Token
                          </TableHead>
                          <TableHead className="align-middle h-8 row-span-2">
                            Amount
                          </TableHead>
                          <TableHead className="text-right align-middle h-8">
                            Value
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.payment.map((amount, i) => {
                          const symbol = currencies[i].symbol;
                          return (
                            <TableRow key={symbol}>
                              <TableCell className="flex items-center gap-1.5 font-medium">
                                <TokenBadge
                                  withoutIcon
                                  token={symbol}
                                  className={`size-1.5 rounded-none rotate-45`}
                                />
                                {symbol}
                              </TableCell>
                              <TableCell>{formatValue(amount)}</TableCell>
                              <TableCell
                                className={cn(
                                  "text-right",
                                  donorValues[i].isNegative() &&
                                    "text-destructive",
                                  donorValues[i].isZero() &&
                                    "text-muted-foreground/70",
                                )}
                              >
                                {formatValue(donorValues[i], {
                                  withIndexSign: true,
                                })}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="font-bold text-right"
                          >
                            Total
                          </TableCell>
                          <TableCell className={cn("text-right")}>
                            {formatValue(sum(donorValues), {
                              withIndexSign: true,
                            })}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              );
            }
            case "VALUATIONS_UPDATED": {
              const isUpdater = event.playerId === currentAgent.deviceId;

              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger>
                    <Settings2Icon className="p-2 size-10 rounded-full bg-muted" />
                    <div className="flex flex-col flex-grow items-start">
                      <strong className="text-muted-foreground">
                        Valuations updated
                      </strong>

                      <div className="flex gap-2 mt-2">
                        {event.newValuations.map((valuation, i) => {
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <p className="text-sm">{valuation.toFixed(1)}</p>
                              <TokenBadge
                                withoutIcon
                                token={currencies[i].symbol}
                                className="size-2 rounded-none rotate-45"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {!isUpdater && (
                        <p className="text-left text-sm mt-1">
                          by <strong>{event.playerName}</strong>
                        </p>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table className="gap-4 text-xs text-center">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="align-middle h-8 row-span-2">
                            Token
                          </TableHead>
                          <TableHead className="text-right align-middle h-8 row-span-2">
                            Old
                          </TableHead>
                          <TableHead className="text-right align-middle h-8">
                            New
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.newValuations.map((valuation, i) => {
                          const symbol = currencies[i].symbol;
                          return (
                            <TableRow key={symbol}>
                              <TableCell className="flex items-center gap-1.5 font-medium">
                                <TokenBadge
                                  withoutIcon
                                  token={symbol}
                                  className={`size-1.5 rounded-none rotate-45`}
                                />
                                {symbol}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "text-right",
                                  event.oldValuations[i].isNegative() &&
                                    "text-destructive",
                                  event.oldValuations[i].isZero() &&
                                    "text-muted-foreground/70",
                                )}
                              >
                                {event.oldValuations[i].toFixed(1)}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "text-right",
                                  valuation.isNegative() && "text-destructive",
                                  valuation.isZero() &&
                                    "text-muted-foreground/70",
                                )}
                              >
                                {event.oldValuations[i].lt(valuation) && (
                                  <ArrowUpIcon className="inline size-3 align-baseline -m-0.5 mr-0.5 text-green-500 " />
                                )}
                                {event.oldValuations[i].gt(valuation) && (
                                  <ArrowDownIcon className="inline size-3 align-baseline -m-0.5 mr-0.5  text-red-500" />
                                )}
                                {valuation.toFixed(1)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            case "PLAYER_JOINED": {
              const isJoiner = event.id === currentAgent.deviceId;

              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger disabled>
                    <UserRoundPlusIcon className="p-2 size-10 rounded-full bg-muted" />
                    <div className="flex flex-col flex-grow items-start">
                      <strong className="text-muted-foreground">
                        Player Joined
                      </strong>

                      <div className="flex gap-2 items-center">
                        <CharacterBadge
                          character={event.character}
                          key={`${event.id}-badge`}
                          className="p-2 size-12 rounded-full bg-muted"
                        >
                          {event.cause && (
                            <TokenBadge
                              token={event.cause}
                              className="absolute bottom-0 right-0 border-background border size-5 "
                            />
                          )}
                        </CharacterBadge>
                        <div className="flex flex-col text-left text-sm leading-none">
                          <strong>{event.name}</strong>
                          {event.cause && (
                            <span>{cause[event.cause].name} </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                </AccordionItem>
              );
            }

            default:
              return null;
          }
        })
        .filter((item) => item)}
    </Accordion>
  );
};

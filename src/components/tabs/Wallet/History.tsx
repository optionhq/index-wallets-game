import { BalancesDonut } from "@/components/BalancesDonut";
import { CharacterIcon } from "@/components/CharacterIcon";
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
import { DONATION_REWARD } from "@/config";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/game/formatValue";
import { valueOf } from "@/lib/indexWallets/valueOf";
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
              const senderValues = event.buyerNetworkValuations.map(
                (valuation, i) => valuation.mul(event.payment[i]),
              );
              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger>
                    <BanknoteIcon
                      className={cn(
                        "size-10 overflow-visible rounded-full bg-muted p-2",
                        isRecipient && "bg-green-100",
                      )}
                    />
                    <div className="flex flex-grow flex-col items-start">
                      <strong className="text-muted-foreground">
                        Payment {isRecipient && "received"}
                        {isSender && "sent"}
                      </strong>
                      <div className="mt-2 flex items-center gap-1">
                        <p>
                          {formatValue(
                            valueOf(event.payment, currentAgent.valuations),
                            {
                              withIndexSign: true,
                            },
                          )}
                        </p>
                        <BalancesDonut balances={event.payment} className="p-1">
                          <div className="size-2 rounded-full bg-background" />{" "}
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
                    <Table className="gap-4 text-center text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="row-span-2 h-8 align-middle">
                            Token
                          </TableHead>
                          <TableHead className="row-span-2 h-8 align-middle">
                            Amount
                          </TableHead>
                          <TableHead className="h-8 text-right align-middle">
                            Value to {isRecipient ? "you" : event.toName}
                          </TableHead>
                          <TableHead className="h-8 text-right align-middle">
                            Value to {isSender ? "you" : event.fromName}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {event.payment.map((amount, i) => {
                          const symbol = currencies[i].symbol;
                          const valueSent = senderValues[i] ?? bn(0);
                          return (
                            <TableRow key={symbol}>
                              <TableCell className="flex items-center gap-1.5 font-medium">
                                <TokenBadge
                                  withoutIcon
                                  token={symbol}
                                  className={`size-1.5 rotate-45 rounded-none`}
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
                                  valueSent.isNegative() && "text-destructive",
                                  valueSent.isZero() &&
                                    "text-muted-foreground/70",
                                )}
                              >
                                {formatValue(valueSent, {
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
                            className="text-right font-bold"
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
                (event.donorNetworkValuations[i] ?? bn(0)).mul(amount),
              );
              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger>
                    <HandHeartIcon className="size-10 rounded-full bg-muted p-2" />
                    <div className="flex flex-grow flex-col items-start">
                      <strong className="text-muted-foreground">
                        Donation
                      </strong>

                      <div className="mt-2 flex items-center gap-1">
                        <p>
                          {formatValue(sum(donorValues), {
                            withIndexSign: true,
                          })}
                        </p>
                        <BalancesDonut balances={event.payment} className="p-1">
                          <div className="size-2 rounded-full bg-background" />{" "}
                        </BalancesDonut>
                      </div>
                      <span className="text-left text-sm">
                        {!isDonor && (
                          <>
                            <strong>{event.playerName}</strong>{" "}
                          </>
                        )}
                        acquired{" "}
                        <strong>
                          {" "}
                          {DONATION_REWARD}{" "}
                          <TokenBadge
                            withoutIcon
                            token={event.cause}
                            className="mb-0.5 inline-block size-1.5 rotate-45 rounded-none"
                          />{" "}
                          {event.cause}{" "}
                        </strong>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table className="gap-4 text-center text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="row-span-2 h-8 align-middle">
                            Token
                          </TableHead>
                          <TableHead className="row-span-2 h-8 align-middle">
                            Amount
                          </TableHead>
                          <TableHead className="h-8 text-right align-middle">
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
                                  className={`size-1.5 rotate-45 rounded-none`}
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
                            className="text-right font-bold"
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
                    <Settings2Icon className="size-10 rounded-full bg-muted p-2" />
                    <div className="flex flex-grow flex-col items-start">
                      <strong className="text-muted-foreground">
                        Valuations updated
                      </strong>

                      <div className="mt-2 flex gap-2">
                        {event.newValuations.map((valuation, i) => {
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <p className="text-sm">{valuation.toFixed(1)}</p>
                              <TokenBadge
                                withoutIcon
                                token={currencies[i].symbol}
                                className="size-2 rotate-45 rounded-none"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {!isUpdater && (
                        <p className="mt-1 text-left text-sm">
                          by <strong>{event.playerName}</strong>
                        </p>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table className="gap-4 text-center text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="row-span-2 h-8 align-middle">
                            Token
                          </TableHead>
                          <TableHead className="row-span-2 h-8 text-right align-middle">
                            Old
                          </TableHead>
                          <TableHead className="h-8 text-right align-middle">
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
                                  className={`size-1.5 rotate-45 rounded-none`}
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
                                  <ArrowUpIcon className="-m-0.5 mr-0.5 inline size-3 align-baseline text-green-500" />
                                )}
                                {event.oldValuations[i].gt(valuation) && (
                                  <ArrowDownIcon className="-m-0.5 mr-0.5 inline size-3 align-baseline text-red-500" />
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
              return (
                <AccordionItem value={event.id} key={event.id}>
                  <AccordionTrigger disabled>
                    <UserRoundPlusIcon className="size-10 rounded-full bg-muted p-2" />
                    <div className="flex flex-grow flex-col items-start">
                      <strong className="text-muted-foreground">
                        Player Joined
                      </strong>

                      <div className="flex items-center gap-2">
                        <CharacterIcon
                          character={event.character}
                          key={`${event.id}-badge`}
                          className="size-12 rounded-full bg-muted p-2"
                        />

                        <div className="flex flex-col text-left text-sm leading-none">
                          <strong>{event.name}</strong>
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

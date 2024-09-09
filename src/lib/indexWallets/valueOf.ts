import { normalizeVectors } from "@/lib/utils/normalizeVectors";
import { BigNumber, dotMultiply, sum } from "mathjs";

export const valueOf = (amounts: BigNumber[], valuations: BigNumber[]) => {
  const [normalizedAmounts, normalizedValuations] = normalizeVectors(
    amounts,
    valuations,
  );
  return sum(dotMultiply(normalizedAmounts, normalizedValuations));
};

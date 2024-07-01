import { flatMap, pipe } from "remeda";

export const intersperse = <T, S>(
  arr: T[],
  separator: (index: number) => S,
): (T | S)[] => {
  return pipe(
    arr,
    flatMap((item, index) =>
      index === arr.length - 1 ? [item] : [item, separator(index)],
    ),
  );
};

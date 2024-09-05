export const formatOrdinal = (n: number) => {
  const suffix = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

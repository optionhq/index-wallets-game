export const generateUUID = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Set the version to 4 (randomly generated UUID)
  array[6] = (array[6] & 0x0f) | 0x40;
  // Set the variant to RFC4122
  array[8] = (array[8] & 0x3f) | 0x80;

  return [...array]
    .map((b, i) =>
      [4, 6, 8, 10].includes(i)
        ? `-${b.toString(16).padStart(2, "0")}`
        : b.toString(16).padStart(2, "0"),
    )
    .join("");
};

export const assetPath = (relativePath = "") => {
  const cleaned = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  return `${import.meta.env.BASE_URL}${cleaned}`;
};

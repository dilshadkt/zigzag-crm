// Truncate text with ellipsis if longer than specified length
export const truncateText = (text, maxLength = 15) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

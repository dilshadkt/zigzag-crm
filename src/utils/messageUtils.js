/**
 * Groups messages by date for displaying date separators in chat
 * @param {Array} messages - Array of message objects
 * @returns {Array} Array of objects with date and messages
 */
export const groupMessagesByDate = (messages) => {
  if (!messages || messages.length === 0) return [];

  const grouped = {};

  messages.forEach((message) => {
    // Use timestamp if available, otherwise use createdAt or current time
    const messageDate = message.timestamp || message.createdAt || new Date();
    const dateKey = new Date(messageDate).toDateString();

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: messageDate,
        messages: [],
      };
    }

    grouped[dateKey].messages.push(message);
  });

  // Convert to array and sort by date
  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

/**
 * Formats a date for display in chat date separators
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatChatDate = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare only dates
  const messageDateOnly = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return "Yesterday";
  } else {
    // Check if it's within the current year
    if (messageDate.getFullYear() === today.getFullYear()) {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }
};

/**
 * Checks if two dates are on the same day
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} True if dates are on the same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

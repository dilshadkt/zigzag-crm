import React from "react";

const TypingIndicator = React.memo(({ typingUsers = [] }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const firstUser = typingUsers[0];
  const otherCount = typingUsers.length - 1;

  // Helper function to get user display name
  const getUserName = (user) => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return "Unknown User";
  };

  const firstName = getUserName(firstUser);
  const secondName = typingUsers.length > 1 ? getUserName(typingUsers[1]) : "";

  return (
    <div className="flex gap-3 mb-4">
      <img
        src={
          firstUser.profileImage || firstUser.avatar || "/api/placeholder/32/32"
        }
        alt={firstName}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="max-w-xs lg:max-w-md">
        <p className="text-xs text-gray-500 mb-1">
          {typingUsers.length === 1
            ? `${firstName} is typing...`
            : typingUsers.length === 2
            ? `${firstName} and ${secondName} are typing...`
            : `${firstName} and ${otherCount} others are typing...`}
        </p>
        <div className="bg-gray-100 rounded-2xl px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TypingIndicator;

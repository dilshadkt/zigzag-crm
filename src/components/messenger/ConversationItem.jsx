import React from "react";

const ConversationItem = ({
  item,
  isGroup = false,
  isSelected = false,
  onSelect,
}) => (
  <div
    className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg ${
      isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
    }`}
    onClick={() => onSelect(item, isGroup)}
  >
    <div className="relative">
      {isGroup ? (
        <div
          className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center text-white text-lg`}
        >
          {item.avatar}
        </div>
      ) : (
        <img
          src={
            item.avatar === "/api/placeholder/32/32"
              ? "/image/noProfile.svg"
              : item.avatar
          }
          alt={item.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold text-gray-900 text-sm truncate">
          {item.name}
        </h5>
        <span className="text-xs text-gray-500">{item.time}</span>
      </div>
      <p className="text-sm text-gray-600 truncate mt-1">{item.lastMessage}</p>
    </div>
    {(item.unread || item.unreadCount > 0) && (
      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
        {item.unread || item.unreadCount}
      </div>
    )}
  </div>
);

export default ConversationItem;

import React from "react";

const ChatHeader = ({ selectedConversation, onlineUsers = [] }) => {
  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.id === userId);
  };

  const getOnlineCount = () => {
    if (!selectedConversation.isGroup) return 0;
    // For groups, count online members (this would come from API in real implementation)
    return Math.floor(Math.random() * 6) + 1; // Mock data
  };

  const getTotalMembers = () => {
    if (!selectedConversation.isGroup) return 0;
    return selectedConversation.memberCount || 6; // Mock data
  };

  return (
    <div className="h-[70px] flex items-center justify-between border-b border-gray-200 px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          {selectedConversation.isGroup ? (
            <div
              className={`w-10 h-10 ${selectedConversation.bgColor} rounded-full flex items-center justify-center text-white text-lg`}
            >
              {selectedConversation.avatar}
            </div>
          ) : (
            <>
              <img
                src={
                  selectedConversation.avatar === "/api/placeholder/32/32"
                    ? "/image/noProfile.svg"
                    : selectedConversation.avatar
                }
                alt={selectedConversation.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {/* Online indicator for direct messages */}
              {isUserOnline(selectedConversation.userId) && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {selectedConversation.name}
          </h3>
          {selectedConversation.isGroup ? (
            <p className="text-sm text-gray-500">
              {getOnlineCount()} of {getTotalMembers()} members online
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {isUserOnline(selectedConversation.userId) ? (
                <span className="text-green-600">Online</span>
              ) : (
                <span>Last seen recently</span>
              )}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Search button */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* Video call button */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* More options button */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

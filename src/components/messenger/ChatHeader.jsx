import React, { useState, useRef, useEffect } from "react";

const ChatHeader = ({
  selectedConversation,
  onlineUsers = [],
  onClearChat,
  onShowMediaPanel,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

  const handleClearChat = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all messages in this conversation? This action cannot be undone."
      )
    ) {
      onClearChat && onClearChat();
      setShowMenu(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="h-[70px] flex items-center justify-between border-b border-gray-200 px-6">
      {/* Left side - Avatar and Info (clickable to open media panel) */}
      <button
        onClick={onShowMediaPanel}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 -ml-3 transition-colors cursor-pointer"
        title="View shared media and files"
      >
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
        <div className="text-left">
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
      </button>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 relative" ref={menuRef}>
        {/* Media Panel Button */}
        <button
          onClick={onShowMediaPanel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="View shared media and files"
        >
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* More options button */}
        {/* More options button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
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

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={handleClearChat}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-3 text-red-600 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Clear Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;

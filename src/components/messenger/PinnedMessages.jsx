import React from "react";

const PinnedMessages = ({
  pinnedMessages = [],
  onUnpin,
  onClose,
  onJumpToMessage,
}) => {
  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const formatMessagePreview = (content) => {
    if (!content) return "";
    return content.length > 60 ? content.substring(0, 60) + "..." : content;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-blue-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
            </svg>
            <span className="text-sm font-semibold text-blue-900">
              {pinnedMessages.length} Pinned Message
              {pinnedMessages.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Show preview of the most recent pinned message */}
          {pinnedMessages.length > 0 && (
            <div className="space-y-2">
              {pinnedMessages.slice(0, 2).map((message) => (
                <div
                  key={message._id || message.id}
                  className="bg-white rounded-lg p-2 shadow-sm border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => onJumpToMessage && onJumpToMessage(message)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={
                            message.sender?.profileImage ||
                            message.sender?.avatar ||
                            "/api/placeholder/24/24"
                          }
                          alt={`${message.sender?.firstName || ""} ${
                            message.sender?.lastName || ""
                          }`}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-gray-700 truncate">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {formatMessagePreview(
                          message.content || message.message
                        )}
                      </p>
                    </div>
                    {onUnpin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpin(message._id || message.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Unpin message"
                      >
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {pinnedMessages.length > 2 && (
                <div className="text-xs text-blue-600 text-center">
                  +{pinnedMessages.length - 2} more pinned message
                  {pinnedMessages.length - 2 > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
            title="Close pinned messages"
          >
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PinnedMessages;

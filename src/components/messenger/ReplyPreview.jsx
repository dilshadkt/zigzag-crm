import React from "react";

const ReplyPreview = ({ replyingTo, onCancel }) => {
  if (!replyingTo) return null;

  const formatMessagePreview = (content) => {
    if (!content) return "";
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  const getMessageTypeIcon = (message) => {
    if (
      message.type === "image" ||
      message.attachments?.some((a) => a.mimetype?.startsWith("image/"))
    ) {
      return "🖼️";
    }
    if (
      message.type === "voice" ||
      message.attachments?.some((a) => a.mimetype?.startsWith("audio/"))
    ) {
      return "🎤";
    }
    if (message.attachments?.length > 0) {
      return "📎";
    }
    return "💬";
  };

  return (
    <div className="border-t border-gray-200 bg-blue-50 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-4 h-4 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="text-xs font-semibold text-blue-900">
              Replying to {replyingTo.sender || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 pl-6">
            <span className="text-sm">{getMessageTypeIcon(replyingTo)}</span>
            <p className="text-sm text-gray-600 truncate">
              {formatMessagePreview(replyingTo.message || replyingTo.content)}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
          title="Cancel reply"
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
      </div>
    </div>
  );
};

export default ReplyPreview;

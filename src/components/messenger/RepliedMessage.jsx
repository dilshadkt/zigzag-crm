import React from "react";

const RepliedMessage = ({ repliedMessage, isOwn = false }) => {
  if (!repliedMessage) return null;

  const formatMessagePreview = (content) => {
    if (!content) return "";
    return content.length > 60 ? content.substring(0, 60) + "..." : content;
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
    return null;
  };

  const senderName = repliedMessage.sender
    ? `${repliedMessage.sender.firstName || ""} ${
        repliedMessage.sender.lastName || ""
      }`.trim()
    : "Unknown";

  return (
    <div
      className={`mb-2 pl-3 border-l-4 ${
        isOwn ? "border-blue-200" : "border-gray-400"
      } py-1`}
    >
      <div className="flex items-center gap-2 mb-1">
        <svg
          className={`w-3 h-3 ${
            isOwn ? "text-blue-200" : "text-gray-500"
          } flex-shrink-0`}
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
        <span
          className={`text-xs font-medium ${
            isOwn ? "text-blue-200" : "text-gray-600"
          }`}
        >
          {senderName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {getMessageTypeIcon(repliedMessage) && (
          <span className="text-sm">{getMessageTypeIcon(repliedMessage)}</span>
        )}
        <p
          className={`text-xs ${
            isOwn ? "text-blue-100" : "text-gray-600"
          } truncate`}
        >
          {formatMessagePreview(
            repliedMessage.content || repliedMessage.message
          )}
        </p>
      </div>
    </div>
  );
};

export default RepliedMessage;

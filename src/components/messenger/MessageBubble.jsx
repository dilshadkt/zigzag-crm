import React from "react";

const MessageBubble = React.memo(({ message }) => {
  return (
    <div
      className={`flex w-full mb-4 ${
        message.isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[70%] ${
          message.isOwn ? "flex-row-reverse" : "flex-row"
        } gap-2`}
      >
        {/* Avatar - only show for received messages */}
        {!message.isOwn && (
          <div className="flex-shrink-0">
            <img
              src={message.avatar}
              alt={message.sender}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}

        {/* Message content */}
        <div
          className={`flex flex-col ${
            message.isOwn ? "items-end" : "items-start"
          }`}
        >
          {/* Sender name and time for received messages */}
          {!message.isOwn && (
            <div className="mb-1">
              <span className="text-xs text-gray-500">
                {message.sender} • {message.time}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`
              px-4 py-2 rounded-2xl max-w-full break-words
              ${
                message.isOwn
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-800 rounded-bl-sm"
              }
              ${message.isPending ? "opacity-70" : ""}
            `}
          >
            <div className="flex items-end gap-2">
              <p className="text-sm leading-relaxed">{message.message}</p>

              {/* Pending indicator for sent messages */}
              {message.isPending && message.isOwn && (
                <div className="flex space-x-1 flex-shrink-0">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Time and status for sent messages */}
          {message.isOwn && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500">{message.time}</span>

              {message.isPending ? (
                <svg
                  className="w-3 h-3 text-gray-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  {/* Message status indicators */}
                  {message.status === "sent" && (
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  {message.status === "delivered" && (
                    <div className="flex">
                      <svg
                        className="w-3 h-3 text-gray-400 -mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <svg
                        className="w-3 h-3 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {message.status === "read" && (
                    <div className="flex">
                      <svg
                        className="w-3 h-3 text-blue-500 -mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <svg
                        className="w-3 h-3 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;

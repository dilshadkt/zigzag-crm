import React, { useRef } from "react";

const ChatInput = ({
  messageInput,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onFileUpload,
  onTyping,
  isTyping,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    onInputChange(e);
    // Trigger typing indicator
    if (onTyping) {
      onTyping(e.target.value.length > 0);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset file input
    e.target.value = "";
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleFileClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={disabled}
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
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        <div className="flex-1 relative">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={onKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isTyping || disabled}
          />
          {messageInput.length > 0 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-gray-400">
                {messageInput.length}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onSendMessage}
          disabled={!messageInput.trim() || isTyping || disabled}
          className={`p-2 rounded-lg transition-all ${
            messageInput.trim() && !isTyping && !disabled
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isTyping ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

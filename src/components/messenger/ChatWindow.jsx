import React from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

const ChatWindow = ({
  selectedConversation,
  messages = [],
  messageInput,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onFileUpload,
  onTyping,
  typingUsers = [],
  messagesEndRef,
  onlineUsers = [],
  loading = false,
}) => {
  // Debug logging to track message rendering
  React.useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      // Check for duplicate IDs
      const messageIds = messages.map((m) => m.id);
      const uniqueIds = [...new Set(messageIds)];
      if (messageIds.length !== uniqueIds.length) {
        console.warn("⚠️ DUPLICATE MESSAGE IDs DETECTED:", messageIds);
      }
    }
  }, [selectedConversation, messages]);

  if (!selectedConversation) {
    return (
      <div className="col-span-3 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-center text-gray-500 h-full">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-1">
              Choose a conversation to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="col-span-3 overflow-y-auto flex flex-col">
        <ChatHeader
          selectedConversation={selectedConversation}
          onlineUsers={onlineUsers}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-3 overflow-y-auto flex flex-col">
      <ChatHeader
        selectedConversation={selectedConversation}
        onlineUsers={onlineUsers}
      />

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {typingUsers.length > 0 && (
              <TypingIndicator typingUsers={typingUsers} />
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-2">
              {selectedConversation.isGroup
                ? "Start the conversation with your team!"
                : "Send a message to start the conversation!"}
            </p>
          </div>
        )}
      </div>

      <ChatInput
        messageInput={messageInput}
        onInputChange={onInputChange}
        onKeyPress={onKeyPress}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        onTyping={onTyping}
        isTyping={typingUsers.length > 0}
        disabled={loading}
      />
    </div>
  );
};

export default ChatWindow;

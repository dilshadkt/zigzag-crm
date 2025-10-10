import React, { useState, useEffect } from "react";
import Header from "../../components/shared/header";
import { ConversationList, ChatWindow } from "../../components/messenger";
import SocketDebugger from "../../components/messenger/SocketDebugger";
import { useChat } from "../../hooks/useChat";

const Messenger = () => {
  const [collapsedSections, setCollapsedSections] = useState({
    group: false,
    direct: false,
  });

  const {
    conversations,
    selectedConversation,
    messages,
    onlineUsers,
    loading,
    error,
    messagesEndRef,
    pinnedMessages,
    mentionedUsers,
    replyingTo,
    selectConversation,
    sendMessage,
    sendTypingIndicator,
    uploadFile,
    getTypingUsers,
    setError,
    createDirectConversation,
    loadConversations,
    loadProjectGroupChats,
    ensureProjectGroupChats,
    pinMessage,
    unpinMessage,
    deleteMessage,
    clearChat,
    replyToMessage,
    cancelReply,
    setMentionedUsers,
  } = useChat();
  const [messageInput, setMessageInput] = useState("");
  const [currentMentions, setCurrentMentions] = useState([]);

  const toggleSection = (sectionType) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionType]: !prev[sectionType],
    }));
  };

  const handleSelectConversation = async (conversation, isGroup) => {
    const conversationData = {
      ...conversation,
      isGroup,
      type: isGroup ? "project" : "direct",
    };
    await selectConversation(conversationData);
  };

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      // Extract mentions from message input
      const mentionIds = currentMentions.map((user) => user._id || user.id);
      const replyToId = replyingTo?.id || replyingTo?._id || null;

      await sendMessage(messageInput, [], "text", mentionIds, replyToId);
      setMessageInput("");
      setCurrentMentions([]);
      cancelReply(); // Clear reply state after sending
    }
  };

  const handleMentionSelect = (user) => {
    setCurrentMentions((prev) => [...prev, user]);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file, fileCategory) => {
    try {
      const uploadResult = await uploadFile(file);
      if (uploadResult) {
        // Determine message type and content based on file category
        let messageType = "file";
        let messageContent = `📎 ${file.name}`;

        if (fileCategory.isImage) {
          messageType = "image";
          messageContent = `🖼️ ${file.name}`;
        } else if (fileCategory.isVideo) {
          messageType = "file";
          messageContent = `🎥 ${file.name}`;
        } else if (fileCategory.isAudio) {
          messageType = fileCategory.isVoice ? "voice" : "file";
          messageContent = fileCategory.isVoice
            ? "🎤 Voice Message"
            : `🎵 ${file.name}`;
        } else if (fileCategory.isDocument) {
          messageType = "file";
          messageContent = `📄 ${file.name}`;
        } else if (fileCategory.isArchive) {
          messageType = "file";
          messageContent = `📦 ${file.name}`;
        }

        // Send message with proper type and attachment
        await sendMessage(messageContent, [uploadResult], messageType);
      }
    } catch (err) {
      setError("Failed to upload file");
    }
  };

  const handleTyping = (isTyping) => {
    sendTypingIndicator(isTyping);
  };

  const handleCreateDirectConversation = async (employeeId) => {
    try {
      const newConversation = await createDirectConversation(employeeId);
      if (newConversation) {
        // Refresh conversations to show the new one
        await loadConversations();
        // Optionally select the new conversation
        await selectConversation(newConversation);
      }
    } catch (err) {
      setError("Failed to create conversation");
    }
  };

  const typingUsers = getTypingUsers();

  // Get participants for mention autocomplete
  const participants =
    selectedConversation?.participants ||
    selectedConversation?.project?.teams ||
    [];

  // Ensure project group chats exist when component mounts
  useEffect(() => {
    const initializeProjectChats = async () => {
      try {
        await ensureProjectGroupChats();
      } catch (err) {
        console.error("Failed to ensure project group chats:", err);
      }
    };

    initializeProjectChats();
  }, []);

  return (
    <section className="flex flex-col w-full h-full gap-y-3">
      <Header>Messenger</Header>

      {/* Temporary Debug Component */}
      {/* <div className="mb-4">
        <SocketDebugger />
      </div> */}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>×
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 w-full h-full bg-white rounded-2xl overflow-hidden">
        <ConversationList
          conversations={conversations}
          collapsedSections={collapsedSections}
          onToggleSection={toggleSection}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          loading={loading}
          error={loading ? null : error}
          onCreateDirectConversation={handleCreateDirectConversation}
        />

        <ChatWindow
          selectedConversation={selectedConversation}
          messages={messages}
          messageInput={messageInput}
          onInputChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onTyping={handleTyping}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          onlineUsers={onlineUsers}
          loading={loading}
          pinnedMessages={pinnedMessages}
          onPinMessage={pinMessage}
          onUnpinMessage={unpinMessage}
          onDeleteMessage={deleteMessage}
          onClearChat={clearChat}
          onReplyMessage={replyToMessage}
          replyingTo={replyingTo}
          onCancelReply={cancelReply}
          onMentionSelect={handleMentionSelect}
          participants={participants}
          currentUserId={localStorage.getItem("userId")}
        />
      </div>
    </section>
  );
};

export default Messenger;

import { useState, useEffect, useCallback, useRef } from "react";
import socketService from "../services/socketService";
import * as chatService from "../api/chatService";
import { useAuth } from "./useAuth";
import {
  transformMessageData,
  transformConversationData,
} from "../components/messenger/data";

export const useChat = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);

  // Socket event handlers (defined first to avoid hoisting issues)
  const handleNewMessage = useCallback(
    (message) => {
      // Ensure we use the correct conversation ID
      const conversationId = message.conversationId || message.conversation;

      // Skip if this is our own message and we already have an optimistic version
      const isOwnMessage =
        (message.sender?._id || message.sender?.id || message.sender) ===
        currentUserId;

      setMessages((prev) => {
        const conversationMessages = prev[conversationId] || [];

        // For own messages, check if we already have a recent optimistic message
        if (isOwnMessage) {
          const recentOptimisticMessage = conversationMessages.find(
            (msg) =>
              msg.isPending &&
              msg.message === message.content &&
              Math.abs(new Date() - new Date(msg.timestamp)) < 10000 // Within 10 seconds
          );

          if (recentOptimisticMessage) {
            console.log(
              "🔄 Replacing optimistic message with real message from socket"
            );
            // Replace the optimistic message with the real one
            const transformedMessage = transformMessageData(
              [message],
              currentUserId
            )[0];
            return {
              ...prev,
              [conversationId]: conversationMessages.map((msg) =>
                msg.id === recentOptimisticMessage.id ? transformedMessage : msg
              ),
            };
          }
        }

        // Check if message already exists (prevent other types of duplicates)
        const messageExists = conversationMessages.some(
          (msg) =>
            msg.id === (message._id || message.id) ||
            (msg.message === message.content &&
              Math.abs(new Date(msg.timestamp) - new Date(message.createdAt)) <
                5000)
        );

        if (messageExists) {
          console.log(
            "Message already exists, skipping duplicate:",
            message._id || message.id
          );
          return prev;
        }

        // Add new message
        const transformedMessage = transformMessageData(
          [message],
          currentUserId
        )[0];
        console.log("📨 Adding new message from socket:", transformedMessage);

        return {
          ...prev,
          [conversationId]: [...conversationMessages, transformedMessage],
        };
      });

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) => {
          const isCurrentConversation =
            conv.id === conversationId ||
            conv._id === conversationId ||
            conv.id === selectedConversation?.id ||
            conv._id === selectedConversation?.id;

          if (conv.id === conversationId || conv._id === conversationId) {
            const newUnreadCount = isCurrentConversation
              ? 0
              : (conv.unreadCount || 0) + 1;

            console.log(
              `📬 Updating unread count for conversation: ${conv.name} (${
                isCurrentConversation ? "current" : "not current"
              }) - new count: ${newUnreadCount}`
            );

            return {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: newUnreadCount,
              unread: newUnreadCount, // Keep both for compatibility
            };
          }
          return conv;
        })
      );
    },
    [selectedConversation, currentUserId]
  );

  const handleTypingEvent = useCallback(
    ({ conversationId, userId, isTyping, user }) => {
      if (conversationId === selectedConversation?.id) {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: isTyping
            ? { ...prev[conversationId], [userId]: user }
            : { ...prev[conversationId], [userId]: undefined },
        }));
      }
    },
    [selectedConversation, currentUserId]
  );

  const handleUserOnline = useCallback((user) => {
    setOnlineUsers((prev) => [...prev.filter((u) => u.id !== user.id), user]);
  }, []);

  const handleUserOffline = useCallback((userId) => {
    setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleConversationUpdate = useCallback((updatedConversation) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
  }, []);

  const handleMessageUpdate = useCallback((updatedMessage) => {
    setMessages((prev) => ({
      ...prev,
      [updatedMessage.conversationId]:
        prev[updatedMessage.conversationId]?.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        ) || [],
    }));
  }, []);

  const handleMessagesRead = useCallback(
    ({ conversationId, messageIds, readBy }) => {
      console.log("👁️ Messages read event received:", {
        conversationId,
        messageIds,
        readBy,
      });

      setMessages((prev) => {
        const conversationMessages = prev[conversationId] || [];
        const updatedMessages = conversationMessages.map((msg) => {
          if (messageIds.includes(msg.id) && msg.isOwn) {
            // Update status to "read" for own messages that were read by others
            return {
              ...msg,
              status: "read",
              readBy: [...(msg.readBy || []), readBy],
            };
          }
          return msg;
        });

        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });
    },
    []
  );

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socketService.connect(token);

      // Set up socket listeners
      socketService.onNewMessage(handleNewMessage);
      socketService.onTyping(handleTypingEvent);
      socketService.onUserOnline(handleUserOnline);
      socketService.onUserOffline(handleUserOffline);
      socketService.onConversationUpdate(handleConversationUpdate);
      socketService.onMessageUpdate(handleMessageUpdate);
      socketService.onMessagesRead(handleMessagesRead);
    }

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [
    handleNewMessage,
    handleTypingEvent,
    handleUserOnline,
    handleUserOffline,
    handleConversationUpdate,
    handleMessageUpdate,
    handleMessagesRead,
  ]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.id, messages[selectedConversation?.id]?.length]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load all conversations
  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await chatService.getConversations();
      if (result.success) {
        // Transform conversations using the proper transformation function
        const transformedData = transformConversationData(
          result.data,
          currentUserId
        );

        // Flatten the transformed data into a single conversations array
        const allConversations = [];
        transformedData.forEach((section) => {
          section.items.forEach((item) => {
            // Find the original conversation data
            const originalConv = result.data.find(
              (conv) => (conv._id || conv.id) === item.id
            );

            allConversations.push({
              ...item,
              type: section.type === "group" ? "project" : "direct",
              // Preserve original conversation data for compatibility
              participants: originalConv?.participants || [],
              project: originalConv?.project || null,
              // Keep the original lastMessage object for internal use, but ensure UI uses the transformed string
              _originalLastMessage: originalConv?.lastMessage || null,
              unreadCount: item.unread || 0,
            });
          });
        });

        setConversations(allConversations);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    if (messages[conversationId]) {
      return; // Already loaded
    }

    try {
      const result = await chatService.getMessages(conversationId);
      if (result.success) {
        const transformedMessages = transformMessageData(
          result.data.messages || [],
          currentUserId
        );

        setMessages((prev) => ({
          ...prev,
          [conversationId]: transformedMessages,
        }));
      }
    } catch (err) {
      setError("Failed to load messages");
    }
  };

  // Select a conversation
  const selectConversation = useCallback(
    async (conversation) => {
      console.log("🎯 Selecting conversation:", conversation);

      // Leave previous conversation room
      if (selectedConversation?.id) {
        console.log(
          "🚪 Leaving previous conversation:",
          selectedConversation.id
        );
        socketService.leaveConversation(selectedConversation.id);
      }

      setSelectedConversation(conversation);

      // Immediately clear unread count for this conversation
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversation.id || conv._id === conversation.id) {
            console.log(
              `🔄 Clearing unread count for conversation: ${conv.name} (was: ${
                conv.unreadCount || conv.unread || 0
              })`
            );
            return { ...conv, unreadCount: 0, unread: 0 };
          }
          return conv;
        })
      );

      // Join new conversation room
      console.log("🚪 Joining new conversation:", conversation.id);
      socketService.joinConversation(conversation.id);

      // Add a small delay to ensure room is joined before proceeding
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Load messages if not already loaded
      console.log("📥 Loading messages for conversation:", conversation.id);
      await loadMessages(conversation.id);

      // Mark messages as read
      console.log(
        "✅ Marking messages as read for conversation:",
        conversation.id
      );
      try {
        await chatService.markMessagesAsRead(conversation.id);
        console.log("✅ Messages marked as read successfully");
      } catch (error) {
        console.error("❌ Failed to mark messages as read:", error);
      }
    },
    [selectedConversation, messages]
  );

  // Send a message
  const sendMessage = useCallback(
    async (messageText, attachments = []) => {
      if (!selectedConversation || !messageText.trim()) {
        console.warn(
          "Cannot send message: No conversation selected or empty message"
        );
        return;
      }

      // Prevent duplicate sends by checking if we're already sending
      const sendingKey = `${selectedConversation.id}_${messageText.trim()}`;
      if (sendMessage._sending && sendMessage._sending.has(sendingKey)) {
        console.warn("🚫 Message already being sent, preventing duplicate");
        return;
      }

      // Initialize sending tracker if it doesn't exist
      if (!sendMessage._sending) {
        sendMessage._sending = new Set();
      }
      sendMessage._sending.add(sendingKey);

      console.log("🎯 Selected conversation:", selectedConversation);
      console.log("📝 Message text:", messageText);

      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        id: `temp_${Date.now()}_${Math.random()}`, // More unique temporary ID
        sender: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        message: messageText.trim(),
        avatar: user?.profileImage || "/api/placeholder/32/32",
        timestamp: new Date(),
        isOwn: true,
        attachments: attachments || [],
        isPending: true, // Mark as pending to show loading state
        status: "sending", // Status for optimistic message
        readBy: [],
      };

      console.log("✨ Created optimistic message:", optimisticMessage);

      // Immediately add message to UI
      setMessages((prev) => {
        const conversationId =
          selectedConversation.id || selectedConversation._id;
        const currentMessages = prev[conversationId] || [];

        // Check if this exact message is already in the list (prevent duplicates)
        const messageExists = currentMessages.some(
          (msg) =>
            msg.id === optimisticMessage.id ||
            (msg.message === optimisticMessage.message && msg.isPending)
        );

        if (messageExists) {
          console.warn("🚫 Optimistic message already exists, skipping add");
          return prev;
        }

        const newMessages = [...currentMessages, optimisticMessage];

        console.log("📦 Adding message to conversation:", conversationId);
        console.log("📦 Current messages count:", currentMessages.length);
        console.log("📦 New messages count:", newMessages.length);

        return {
          ...prev,
          [conversationId]: newMessages,
        };
      });

      // Update conversation last message immediately
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id ||
          conv._id === selectedConversation._id
            ? {
                ...conv,
                lastMessage: messageText.trim(),
                lastMessageTime: new Date().toISOString(),
              }
            : conv
        )
      );

      // Set a timeout to remove pending message if it doesn't get replaced
      const timeoutId = setTimeout(() => {
        console.log(
          "⏰ Timeout: Removing pending message that wasn't replaced"
        );
        setMessages((prev) => {
          const conversationId =
            selectedConversation.id || selectedConversation._id;
          return {
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter(
              (msg) => msg.id !== optimisticMessage.id
            ),
          };
        });
        setError("Message sending timed out. Please try again.");
        // Remove from sending tracker
        sendMessage._sending?.delete(sendingKey);
      }, 15000); // 15 second timeout

      const messageData = {
        conversationId: selectedConversation.id || selectedConversation._id,
        content: messageText.trim(),
        attachments,
        type: "text",
      };

      console.log("📤 Attempting to send message:", messageData);

      try {
        // Send via socket for immediate real-time delivery
        console.log("⚡ Sending message via socket for real-time delivery...");
        console.log("🔗 Socket connected:", socketService.isSocketConnected());

        // Ensure we're in the correct room before sending
        console.log(
          "🔄 Re-joining conversation room to ensure proper connection..."
        );
        socketService.joinConversation(
          selectedConversation.id || selectedConversation._id
        );

        // Small delay to ensure room join is processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        socketService.sendMessage(messageData);

        // Also send via API for persistence
        console.log("📡 Sending message via API for persistence...");
        const result = await chatService.sendMessage(messageData);

        if (result.success) {
          console.log("✅ Message sent successfully via API");

          // Clear the timeout since message was sent successfully
          clearTimeout(timeoutId);
          // Remove from sending tracker
          sendMessage._sending?.delete(sendingKey);

          // The socket event will handle replacing the optimistic message
          // with the real message, so we don't need to do it here
        } else {
          console.error("❌ API message send failed:", result.message);

          // Clear timeout and remove optimistic message on failure
          clearTimeout(timeoutId);
          sendMessage._sending?.delete(sendingKey);
          setMessages((prev) => {
            const conversationId =
              selectedConversation.id || selectedConversation._id;
            return {
              ...prev,
              [conversationId]: (prev[conversationId] || []).filter(
                (msg) => msg.id !== optimisticMessage.id
              ),
            };
          });

          setError(result.message);
        }
      } catch (err) {
        console.error("❌ Error sending message:", err);

        // Clear timeout and remove optimistic message on error
        clearTimeout(timeoutId);
        sendMessage._sending?.delete(sendingKey);
        setMessages((prev) => {
          const conversationId =
            selectedConversation.id || selectedConversation._id;
          return {
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter(
              (msg) => msg.id !== optimisticMessage.id
            ),
          };
        });

        setError("Failed to send message");
      }
    },
    [selectedConversation, user, currentUserId]
  );

  // Handle typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping) => {
      if (!selectedConversation) return;

      socketService.sendTyping(selectedConversation.id, isTyping);

      // Clear existing timeout
      if (typingTimeoutRef.current[selectedConversation.id]) {
        clearTimeout(typingTimeoutRef.current[selectedConversation.id]);
      }

      // Set timeout to stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current[selectedConversation.id] = setTimeout(() => {
          socketService.sendTyping(selectedConversation.id, false);
        }, 3000);
      }
    },
    [selectedConversation]
  );

  // Create direct conversation
  const createDirectConversation = async (userId) => {
    try {
      const result = await chatService.createDirectConversation(userId);
      if (result.success) {
        // Transform the new conversation using the same logic as loadConversations
        const transformedData = transformConversationData(
          [result.data],
          currentUserId
        );
        const directSection = transformedData.find(
          (section) => section.type === "direct"
        );

        if (directSection && directSection.items.length > 0) {
          const transformedConversation = {
            ...directSection.items[0],
            type: "direct",
            participants: result.data.participants || [],
            project: null,
            lastMessage: "", // Ensure this is always a string
            time: "",
            unreadCount: 0,
          };

          // Add to conversations list
          setConversations((prev) => [transformedConversation, ...prev]);
          return transformedConversation;
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create conversation");
    }
  };

  // Upload file
  const uploadFile = async (file) => {
    if (!selectedConversation) return null;

    try {
      const result = await chatService.uploadChatFile(
        file,
        selectedConversation.id
      );
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to upload file");
    }
    return null;
  };

  return {
    // State
    conversations,
    selectedConversation,
    messages: messages[selectedConversation?.id] || [],
    onlineUsers,
    typingUsers: typingUsers[selectedConversation?.id] || {},
    loading,
    error,
    messagesEndRef,

    // Actions
    selectConversation,
    sendMessage,
    sendTypingIndicator,
    createDirectConversation,
    uploadFile,
    loadConversations,
    setError,

    // Utils
    isUserOnline: (userId) => onlineUsers.some((u) => u.id === userId),
    getTypingUsers: () =>
      Object.values(typingUsers[selectedConversation?.id] || {}).filter(
        Boolean
      ),
  };
};

import { useState, useEffect, useCallback, useRef } from "react";
import socketService from "../services/socketService";
import * as chatService from "../api/chatService";
import { uploadSingleFile } from "../api/service";
import { useAuth } from "./useAuth";
import {
  transformMessageData,
  transformConversationData,
} from "../components/messenger/data";
import resolveAttachmentUrl from "../utils/resolveAttachmentUrl";

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
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);

  // Socket event handlers (defined first to avoid hoisting issues)
  const handleNewMessage = useCallback(
    (message) => {
      console.log("🎯 [useChat] NEW MESSAGE RECEIVED:", {
        id: message._id,
        type: message.type,
        content: message.content?.substring(0, 50),
        isSystem: message.type === "system",
        hasMetadata: !!message.metadata,
        metadataAction: message.metadata?.action,
        attachmentCount: message.metadata?.attachments?.length || 0,
      });

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
              msg.message === (message.content || message.message) &&
              Math.abs(new Date() - new Date(msg.timestamp)) < 30000 // Within 30 seconds
          );

          if (recentOptimisticMessage) {
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

        // Enhanced duplicate detection
        const messageContent = message.content || message.message;
        const messageId = message._id || message.id;
        const messageTime = new Date(message.createdAt || message.timestamp);

        const messageExists = conversationMessages.some((msg) => {
          // Check by ID first (most reliable)
          if (msg.id === messageId) {
            return true;
          }

          // Check by content and time (for messages without proper IDs)
          const msgContent = msg.message || msg.content;
          const msgTime = new Date(msg.timestamp || msg.createdAt);
          const timeDiff = Math.abs(msgTime - messageTime);

          // More strict duplicate detection - same content within 10 seconds
          if (msgContent === messageContent && timeDiff < 10000) {
            return true;
          }

          return false;
        });

        if (messageExists) {
          return prev;
        }

        // Add new message
        const transformedMessage = transformMessageData(
          [message],
          currentUserId
        )[0];

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
              lastMessage: message.content || message.message,
              lastMessageTime: message.createdAt || message.timestamp,
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
        conv.id === updatedConversation.id
          ? {
              ...conv,
              id: updatedConversation.id,
              lastMessage: updatedConversation.lastMessage,
              lastMessageTime: updatedConversation.lastMessageTime,
            }
          : conv
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

  const handleMessagePinned = useCallback(
    ({ messageId, conversationId, pinnedBy, pinnedAt }) => {
      console.log("📌 Message pinned event received:", {
        messageId,
        conversationId,
        pinnedBy,
        pinnedAt,
      });

      // Update the message in messages state
      setMessages((prev) => {
        const conversationMessages = prev[conversationId] || [];
        const updatedMessages = conversationMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, isPinned: true, pinnedBy, pinnedAt }
            : msg
        );

        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });

      // Reload pinned messages if this is the selected conversation
      if (selectedConversation?.id === conversationId) {
        loadPinnedMessages(conversationId);
      }
    },
    [selectedConversation]
  );

  const handleMessageUnpinned = useCallback(
    ({ messageId, conversationId, unpinnedBy }) => {
      console.log("📍 Message unpinned event received:", {
        messageId,
        conversationId,
        unpinnedBy,
      });

      // Update the message in messages state
      setMessages((prev) => {
        const conversationMessages = prev[conversationId] || [];
        const updatedMessages = conversationMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, isPinned: false, pinnedBy: null, pinnedAt: null }
            : msg
        );

        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });

      // Reload pinned messages if this is the selected conversation
      if (selectedConversation?.id === conversationId) {
        loadPinnedMessages(conversationId);
      }
    },
    [selectedConversation]
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
      socketService.onMessagePinned(handleMessagePinned);
      socketService.onMessageUnpinned(handleMessageUnpinned);
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
    handleMessagePinned,
    handleMessageUnpinned,
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
    // Check if messages are already loaded and not empty
    if (messages[conversationId] && messages[conversationId].length > 0) {
      console.log(
        "📋 Messages already loaded for conversation:",
        conversationId
      );
      return; // Already loaded
    }

    // Check if we're already loading this conversation
    if (loadMessages._loading && loadMessages._loading.has(conversationId)) {
      console.log(
        "⏳ Already loading messages for conversation:",
        conversationId
      );
      return;
    }

    // Initialize loading tracker if it doesn't exist
    if (!loadMessages._loading) {
      loadMessages._loading = new Set();
    }
    loadMessages._loading.add(conversationId);

    try {
      console.log("📥 Loading messages for conversation:", conversationId);
      const result = await chatService.getMessages(conversationId);
      if (result.success) {
        const rawMessages = result.data.messages || [];
        console.log(`📦 Raw messages from API: ${rawMessages.length}`);

        // Deduplicate messages before transformation
        const uniqueMessages = [];
        const seenIds = new Set();
        const seenContentTime = new Set();

        rawMessages.forEach((msg) => {
          const messageId = msg._id || msg.id;
          const messageContent = msg.content || msg.message;
          const messageTime = new Date(
            msg.createdAt || msg.timestamp
          ).getTime();
          const contentTimeKey = `${messageContent}_${messageTime}`;

          // Skip if we've seen this exact ID
          if (seenIds.has(messageId)) {
            console.log("🚫 Skipping duplicate message by ID:", messageId);
            return;
          }

          // Skip if we've seen this exact content and time combination
          if (seenContentTime.has(contentTimeKey)) {
            console.log(
              "🚫 Skipping duplicate message by content+time:",
              contentTimeKey
            );
            return;
          }

          seenIds.add(messageId);
          seenContentTime.add(contentTimeKey);
          uniqueMessages.push(msg);
        });

        console.log(
          `📦 Unique messages after deduplication: ${uniqueMessages.length}`
        );

        const transformedMessages = transformMessageData(
          uniqueMessages,
          currentUserId
        );

        console.log(
          `📦 Loaded ${transformedMessages.length} messages for conversation:`,
          conversationId
        );

        setMessages((prev) => ({
          ...prev,
          [conversationId]: transformedMessages,
        }));
      } else {
        console.error("❌ Failed to load messages:", result.message);
        setError("Failed to load messages");
      }
    } catch (err) {
      console.error("❌ Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      // Remove from loading tracker
      loadMessages._loading?.delete(conversationId);
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

      // Load pinned messages
      await loadPinnedMessages(conversation.id);

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

  // Load pinned messages for a conversation
  const loadPinnedMessages = async (conversationId) => {
    try {
      const result = await chatService.getPinnedMessages(conversationId);
      if (result.success) {
        setPinnedMessages(result.data || []);
      }
    } catch (err) {
      console.error("Error loading pinned messages:", err);
    }
  };

  // Pin a message
  const pinMessage = useCallback(
    async (message) => {
      if (!selectedConversation) return;

      try {
        const result = await chatService.pinMessage(
          message.id || message._id,
          selectedConversation.id
        );

        if (result.success) {
          console.log("✅ Message pinned successfully");

          // Immediately update the message in the messages state
          setMessages((prev) => {
            const conversationId = selectedConversation.id;
            const conversationMessages = prev[conversationId] || [];
            const updatedMessages = conversationMessages.map((msg) =>
              msg.id === (message.id || message._id)
                ? {
                    ...msg,
                    isPinned: true,
                    pinnedBy: result.data?.data?.pinnedBy,
                    pinnedAt: result.data?.data?.pinnedAt || new Date(),
                  }
                : msg
            );

            return {
              ...prev,
              [conversationId]: updatedMessages,
            };
          });

          // Immediately reload pinned messages to update the banner
          await loadPinnedMessages(selectedConversation.id);
        } else {
          setError(result.message || "Failed to pin message");
        }
      } catch (err) {
        console.error("Error pinning message:", err);
        setError("Failed to pin message");
      }
    },
    [selectedConversation]
  );

  // Unpin a message
  const unpinMessage = useCallback(
    async (message) => {
      if (!selectedConversation) return;

      const messageId = message.id || message._id;
      if (!messageId) {
        console.error("No message ID found for unpinning");
        return;
      }

      try {
        const result = await chatService.unpinMessage(
          messageId,
          selectedConversation.id
        );

        if (result.success) {
          console.log("✅ Message unpinned successfully");

          // Immediately update the message in the messages state
          setMessages((prev) => {
            const conversationId = selectedConversation.id;
            const conversationMessages = prev[conversationId] || [];
            const updatedMessages = conversationMessages.map((msg) => {
              const msgId = msg.id || msg._id;
              return msgId === messageId
                ? { ...msg, isPinned: false, pinnedBy: null, pinnedAt: null }
                : msg;
            });

            return {
              ...prev,
              [conversationId]: updatedMessages,
            };
          });

          // Immediately reload pinned messages to update the banner
          await loadPinnedMessages(selectedConversation.id);
        } else {
          setError(result.message || "Failed to unpin message");
        }
      } catch (err) {
        console.error("Error unpinning message:", err);
        setError("Failed to unpin message");
      }
    },
    [selectedConversation]
  );

  // Send a message
  const sendMessage = useCallback(
    async (
      messageText,
      attachments = [],
      messageType = "text",
      mentions = [],
      replyToId = null
    ) => {
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
        type: messageType, // Set message type (text, file, image, etc.)
        isPending: true, // Mark as pending to show loading state
        status: "sending", // Status for optimistic message
        readBy: [],
        replyTo: replyToId ? replyingTo : null, // Include reply reference in optimistic message
      };
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
        return {
          ...prev,
          [conversationId]: newMessages,
        };
      });

      // Update conversation last message immediately
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
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
        type: messageType,
        mentions: mentions || [],
        replyTo: replyToId || null,
      };
      // console.log("📤 Attempting to send message:", messageData);
      try {
        socketService.joinConversation(
          selectedConversation.id || selectedConversation._id
        );
        // Small delay to ensure room join is processed
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Send via API only - the server will broadcast via socket after processing
        const result = await chatService.sendMessage(messageData);
        if (result.success) {
          // Clear the timeout since message was sent successfully
          clearTimeout(timeoutId);
          // Remove from sending tracker
          sendMessage._sending?.delete(sendingKey);
          // Clear reply state after successful send
          if (replyToId) {
            setReplyingTo(null);
          }
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
        if (directSection) {
          const transformedConversation = {
            ...directSection.items[0],
            type: "direct",
            participants: result.data.participants || [],
            project: null,
            lastMessage: "", // Ensure this is always a string
            time: "",
            unreadCount: 0,
          };
          console.log(conversations);
          console.log(transformedConversation);
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
      // Use the existing uploadSingleFile service from service.js
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadSingleFile(formData);

      if (result.success && result.fileUrl) {
        const resolvedUrl = resolveAttachmentUrl(result.fileUrl);
        // Return attachment data in the format expected by the message model
        return {
          filename: result.originalName || file.name,
          originalName: result.originalName || file.name,
          mimetype: result.mimeType || file.type,
          size: file.size,
          url: resolvedUrl,
        };
      } else {
        setError(result.message || "Failed to upload file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    }
    return null;
  };

  // Load project group chats specifically
  const loadProjectGroupChats = async () => {
    setLoading(true);
    try {
      const result = await chatService.getProjectGroupChats();
      if (result.success) {
        // Transform the project group conversations
        const transformedConversations = result.data.conversations.map(
          (conv) => ({
            ...conv,
            type: "project",
            isGroup: true,
            unreadCount: conv.unreadCount || 0,
          })
        );

        // Update conversations state with project group chats
        setConversations((prev) => {
          // Remove existing project conversations and add new ones
          const nonProjectConversations = prev.filter(
            (conv) => conv.type !== "project"
          );
          return [...transformedConversations, ...nonProjectConversations];
        });

        return transformedConversations;
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error loading project group chats:", err);
      setError("Failed to load project group chats");
    } finally {
      setLoading(false);
    }
  };

  // Ensure all projects have group conversations
  const ensureProjectGroupChats = async () => {
    try {
      const result = await chatService.ensureProjectGroupChats();
      if (result.success) {
        // Reload conversations after ensuring project chats
        await loadConversations();
        return result.data;
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error ensuring project group chats:", err);
      setError("Failed to ensure project group chats");
    }
  };

  // Delete a message
  const deleteMessage = useCallback(
    async (message) => {
      if (!selectedConversation) return;

      const messageId = message.id || message._id;
      if (!messageId) {
        console.error("No message ID found for deletion");
        return;
      }

      try {
        const result = await chatService.deleteMessage(
          messageId,
          selectedConversation.id
        );

        if (result.success) {
          console.log("✅ Message deleted successfully");

          // Immediately remove the message from the messages state
          setMessages((prev) => {
            const conversationId = selectedConversation.id;
            const conversationMessages = prev[conversationId] || [];
            const updatedMessages = conversationMessages.filter((msg) => {
              const msgId = msg.id || msg._id;
              return msgId !== messageId;
            });

            return {
              ...prev,
              [conversationId]: updatedMessages,
            };
          });
        } else {
          setError(result.message || "Failed to delete message");
        }
      } catch (err) {
        console.error("Error deleting message:", err);
        setError("Failed to delete message");
      }
    },
    [selectedConversation]
  );

  // Clear chat (delete all messages)
  const clearChat = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      const result = await chatService.clearChat(selectedConversation.id);

      if (result.success) {
        console.log("✅ Chat cleared successfully");

        // Immediately clear all messages from state
        setMessages((prev) => ({
          ...prev,
          [selectedConversation.id]: [],
        }));

        // Clear pinned messages
        setPinnedMessages([]);
      } else {
        setError(result.message || "Failed to clear chat");
      }
    } catch (err) {
      console.error("Error clearing chat:", err);
      setError("Failed to clear chat");
    }
  }, [selectedConversation]);

  // Set message to reply to
  const replyToMessage = useCallback((message) => {
    setReplyingTo(message);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Handle message deleted event
  const handleMessageDeleted = useCallback(
    ({ messageId, conversationId, deletedBy }) => {
      console.log("🗑️ Message deleted event received:", {
        messageId,
        conversationId,
        deletedBy,
      });

      // Remove the message from messages state
      setMessages((prev) => {
        const conversationMessages = prev[conversationId] || [];
        const updatedMessages = conversationMessages.filter((msg) => {
          const msgId = msg.id || msg._id;
          return msgId !== messageId;
        });

        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });
    },
    []
  );

  // Handle chat cleared event
  const handleChatCleared = useCallback(
    ({ conversationId, clearedBy }) => {
      console.log("🧹 Chat cleared event received:", {
        conversationId,
        clearedBy,
      });

      // Clear all messages in the conversation
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [],
      }));

      // Clear pinned messages if this is the selected conversation
      if (selectedConversation?.id === conversationId) {
        setPinnedMessages([]);
      }
    },
    [selectedConversation]
  );

  // Add socket listeners for delete and clear
  useEffect(() => {
    if (socketService.isSocketConnected()) {
      socketService.onMessageDeleted(handleMessageDeleted);
      socketService.onChatCleared(handleChatCleared);
    }

    return () => {
      if (socketService.getSocket()) {
        socketService.getSocket().off("message_deleted", handleMessageDeleted);
        socketService.getSocket().off("chat_cleared", handleChatCleared);
      }
    };
  }, [handleMessageDeleted, handleChatCleared]);

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
    pinnedMessages,
    mentionedUsers,
    replyingTo,

    // Actions
    selectConversation,
    sendMessage,
    sendTypingIndicator,
    createDirectConversation,
    uploadFile,
    loadConversations,
    loadProjectGroupChats,
    ensureProjectGroupChats,
    pinMessage,
    unpinMessage,
    loadPinnedMessages,
    deleteMessage,
    clearChat,
    replyToMessage,
    cancelReply,
    setError,
    setMentionedUsers,

    // Utils
    isUserOnline: (userId) => onlineUsers.some((u) => u.id === userId),
    getTypingUsers: () =>
      Object.values(typingUsers[selectedConversation?.id] || {}).filter(
        Boolean
      ),
  };
};

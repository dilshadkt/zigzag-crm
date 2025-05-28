const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Store active users and their typing status
const activeUsers = new Map();
const typingUsers = new Map();

const chatHandlers = (io, socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Update user online status
  updateUserOnlineStatus(socket.userId, true);

  // Broadcast user online status
  socket.broadcast.emit("user_online", {
    id: socket.userId,
    name: socket.user.name,
    avatar: socket.user.avatar,
  });

  // Store active user
  activeUsers.set(socket.userId, {
    socketId: socket.id,
    user: socket.user,
  });

  // Join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on("send_message", async (messageData) => {
    try {
      const {
        conversationId,
        content,
        type = "text",
        attachments = [],
      } = messageData;

      // Verify user is participant in conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (!conversation) {
        socket.emit("error", { message: "Conversation not found" });
        return;
      }

      // Create new message
      const message = new Message({
        conversation: conversationId,
        sender: socket.userId,
        content,
        type,
        attachments,
        readBy: [{ user: socket.userId }],
      });

      await message.save();
      await message.populate("sender", "name email avatar");

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();

      // Emit to all users in conversation
      io.to(`conversation_${conversationId}`).emit("new_message", {
        ...message.toObject(),
        conversationId,
      });

      // Update conversation for all participants
      io.to(`conversation_${conversationId}`).emit("conversation_update", {
        id: conversationId,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", ({ conversationId, isTyping }) => {
    const typingKey = `${conversationId}_${socket.userId}`;

    if (isTyping) {
      typingUsers.set(typingKey, {
        userId: socket.userId,
        user: socket.user,
        conversationId,
        timestamp: Date.now(),
      });
    } else {
      typingUsers.delete(typingKey);
    }

    // Broadcast typing status to other users in conversation
    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      conversationId,
      userId: socket.userId,
      user: socket.user,
      isTyping,
    });
  });

  // Handle marking messages as read
  socket.on("mark_as_read", async ({ conversationId, messageIds }) => {
    try {
      // Update read status for messages
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          "readBy.user": { $ne: socket.userId },
        },
        {
          $push: {
            readBy: { user: socket.userId, readAt: new Date() },
          },
        }
      );

      // Notify other users about read status
      socket.to(`conversation_${conversationId}`).emit("messages_read", {
        conversationId,
        messageIds,
        readBy: {
          user: socket.userId,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);

    // Update user offline status
    updateUserOnlineStatus(socket.userId, false);

    // Broadcast user offline status
    socket.broadcast.emit("user_offline", socket.userId);

    // Remove from active users
    activeUsers.delete(socket.userId);

    // Clear typing indicators for this user
    for (const [key, value] of typingUsers.entries()) {
      if (value.userId === socket.userId) {
        typingUsers.delete(key);
        // Notify others that user stopped typing
        socket.to(`conversation_${value.conversationId}`).emit("user_typing", {
          conversationId: value.conversationId,
          userId: socket.userId,
          user: socket.user,
          isTyping: false,
        });
      }
    }
  });
};

// Helper function to update user online status
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date(),
    });
  } catch (error) {
    console.error("Error updating user online status:", error);
  }
};

// Clean up old typing indicators (run periodically)
setInterval(() => {
  const now = Date.now();
  const timeout = 5000; // 5 seconds

  for (const [key, value] of typingUsers.entries()) {
    if (now - value.timestamp > timeout) {
      typingUsers.delete(key);
    }
  }
}, 10000); // Check every 10 seconds

// Get online users
const getOnlineUsers = () => {
  return Array.from(activeUsers.values()).map(({ user }) => ({
    id: user._id,
    name: user.name,
    avatar: user.avatar,
  }));
};

module.exports = {
  chatHandlers,
  getOnlineUsers,
  activeUsers,
};

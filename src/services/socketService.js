import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    const baseURL =
      process.env.NODE_ENV === "production"
        ? "https://crm.zigzagdigitalsolutions.com"
        : "http://localhost:5000";

    this.socket = io(baseURL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      this.isConnected = false;
    });

    // Add error handler for general socket errors
    this.socket.on("error", (error) => {});

    // Add debugging for chat events
    this.socket.on("new_message", (data) => {});

    this.socket.on("message_sent", (data) => {});

    this.socket.on("user_typing", (data) => {});

    this.socket.on("user_online", (data) => {});

    this.socket.on("user_offline", (data) => {});

    this.socket.on("messages_read", (data) => {});

    // Add task status change events
    this.socket.on("task_status_changed", (data) => {
      console.log("📋 Task status changed via socket:", data);
    });

    this.socket.on("new_notification", (data) => {
      console.log("🔔 New notification received via socket:", data);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      console.log("🚪 Joining conversation:", conversationId);
      console.log("🔗 Socket connected:", this.socket.connected);
      console.log("🔗 Socket ID:", this.socket.id);

      this.socket.emit("join_conversation", conversationId);

      // Add a listener for successful room join (if backend sends confirmation)
      this.socket.once("joined_conversation", (data) => {
        console.log("✅ Successfully joined conversation:", data);
      });

      // Add a small delay to check if room was joined
      setTimeout(() => {
        console.log("🏠 Socket rooms after join attempt:", this.socket.rooms);
        // Note: socket.rooms might not be available on client side in some socket.io versions
        // This is mainly for debugging purposes

        // Let's also check if we can get room info another way
        console.log("🔍 Socket adapter rooms:", this.socket.adapter?.rooms);
        console.log("🔍 Socket manager rooms:", this.socket.manager?.rooms);
      }, 100);
    } else {
      console.error("❌ Cannot join conversation: Socket not connected");
      console.error("🔗 Socket exists:", !!this.socket);
      console.error("🔗 Is connected:", this.isConnected);
      console.error("🔗 Socket connected:", this.socket?.connected);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_message", messageData);

      // Add a timeout to check if message was received by server
      setTimeout(() => {
        console.log(
          "⏰ Message send timeout check - if no response from server, there might be an issue"
        );
      }, 5000);
    } else {
      console.error("❌ Cannot send message: Socket not connected");
      console.error("🔗 Socket exists:", !!this.socket);
      console.error("🔗 Is connected:", this.isConnected);
      console.error("🔗 Socket connected:", this.socket?.connected);
    }
  }

  // Listen for task status changes
  onTaskStatusChange(callback) {
    if (this.socket) {
      this.socket.on("task_status_changed", callback);
    }
  }

  // Listen for new notifications
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on("new_notification", callback);
    }
  }

  // Remove task status change listener
  offTaskStatusChange(callback) {
    if (this.socket) {
      this.socket.off("task_status_changed", callback);
    }
  }

  // Remove notification listener
  offNewNotification(callback) {
    if (this.socket) {
      this.socket.off("new_notification", callback);
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  // Listen for message updates (read status, etc.)
  onMessageUpdate(callback) {
    if (this.socket) {
      this.socket.on("message_update", callback);
    }
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    if (this.socket) {
      this.socket.emit("typing", { conversationId, isTyping });
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  // Listen for user online status
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on("user_online", callback);
    }
  }

  // Listen for user offline status
  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on("user_offline", callback);
    }
  }

  // Listen for messages read events
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on("messages_read", callback);
    }
  }

  // Listen for conversation updates
  onConversationUpdate(callback) {
    if (this.socket) {
      this.socket.on("conversation_update", callback);
    }
  }

  // Mark messages as read
  markAsRead(conversationId, messageIds) {
    if (this.socket) {
      this.socket.emit("mark_as_read", { conversationId, messageIds });
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;

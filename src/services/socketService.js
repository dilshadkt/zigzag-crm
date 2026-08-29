import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.pendingListeners = [];
    this.joinedRooms = new Set(); // track rooms to re-join on reconnect
    this.notificationHandlers = new Set();
    this.taskStatusHandlers = new Set();
    this.subtaskAssignedHandlers = new Set();
  }

  _dispatchToHandlers(handlers, data) {
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error("Socket handler error:", error);
      }
    });
  }

  _bindCoreListeners() {
    if (!this.socket || this.socket.__coreListenersBound) return;

    this.socket.__coreListenersBound = true;

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.joinedRooms.forEach((roomName) => {
        this.socket.emit("join_room", roomName);
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      this.isConnected = false;
    });

    this.socket.on("error", () => {});

    this.socket.on("new_notification", (data) => {
      console.log("🔔 New notification received via socket:", data);
      this._dispatchToHandlers(this.notificationHandlers, data);
    });

    this.socket.on("task_status_changed", (data) => {
      console.log("📋 Task status changed via socket:", data);
      this._dispatchToHandlers(this.taskStatusHandlers, data);
    });

    this.socket.on("subtask_assigned", (data) => {
      console.log("📌 Subtask assigned via socket:", data);
      this._dispatchToHandlers(this.subtaskAssignedHandlers, data);
    });

    this.socket.on("points_awarded", (data) => {
      console.log("🏆 Points awarded via socket:", data);
    });

    this.socket.on("new_lead", (data) => {
      console.log("🎯 New lead received via socket:", data);
    });
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.auth = { token };
      this._bindCoreListeners();
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    const getBaseURL = () => {
      if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
      }
      return process.env.NODE_ENV === "production"
        ? "https://crm.zigzagdigitalsolutions.com"
        : "http://localhost:5000";
    };

    const baseURL = getBaseURL();

    this.socket = io(baseURL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this._bindCoreListeners();

    // Attach legacy pending listeners
    if (this.pendingListeners.length > 0) {
      this.pendingListeners.forEach(({ event, callback }) => {
        this.socket.on(event, callback);
      });
    }

    return this.socket;
  }

  _addListener(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.pendingListeners.push({ event, callback });
    }
  }

  _removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    this.pendingListeners = this.pendingListeners.filter(
      (l) => l.event !== event || l.callback !== callback
    );
  }

  // Listen for new leads
  onNewLead(callback) {
    this._addListener("new_lead", callback);
  }

  onPointsAwarded(callback) {
    this._addListener("points_awarded", callback);
  }

  // Remove lead listener
  offNewLead(callback) {
    this._removeListener("new_lead", callback);
  }

  // Listen for lead updates (status change, edit, etc.)
  onLeadUpdated(callback) {
    this._addListener("lead_updated", callback);
  }

  offLeadUpdated(callback) {
    this._removeListener("lead_updated", callback);
  }

  // Listen for new_lead_received (global company notification)
  onNewLeadReceived(callback) {
    this._addListener("new_lead_received", callback);
  }

  offNewLeadReceived(callback) {
    this._removeListener("new_lead_received", callback);
  }

  // Join a named room (e.g. "company_<id>", "project_<id>")
  joinRoom(roomName) {
    this.joinedRooms.add(roomName); // always track it for reconnects
    if (this.socket && this.isConnected) {
      this.socket.emit("join_room", roomName);
    }
    // If not yet connected, the room will be joined in the "connect" handler above
  }

  // Leave a named room
  leaveRoom(roomName) {
    this.joinedRooms.delete(roomName);
    if (this.socket) {
      this.socket.emit("leave_room", roomName);
    }
  }

  offPointsAwarded(callback) {
    this._removeListener("points_awarded", callback);
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

      this.socket.emit("join_conversation", conversationId);

      // Add a listener for successful room join (if backend sends confirmation)
      this.socket.once("joined_conversation", (data) => {
      });

      // Add a small delay to check if room was joined
      setTimeout(() => {

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
    this.taskStatusHandlers.add(callback);
  }

  // Remove task status change listener
  offTaskStatusChange(callback) {
    this.taskStatusHandlers.delete(callback);
  }

  // Listen for new notifications
  onNewNotification(callback) {
    this.notificationHandlers.add(callback);
  }

  // Remove notification listener
  offNewNotification(callback) {
    this.notificationHandlers.delete(callback);
  }

  onSubtaskAssigned(callback) {
    this.subtaskAssignedHandlers.add(callback);
  }

  offSubtaskAssigned(callback) {
    this.subtaskAssignedHandlers.delete(callback);
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

  // Pin a message
  pinMessage(conversationId, messageId) {
    if (this.socket) {
      this.socket.emit("pin_message", { conversationId, messageId });
    }
  }

  // Unpin a message
  unpinMessage(conversationId, messageId) {
    if (this.socket) {
      this.socket.emit("unpin_message", { conversationId, messageId });
    }
  }

  // Listen for message pinned events
  onMessagePinned(callback) {
    if (this.socket) {
      this.socket.on("message_pinned", callback);
    }
  }

  // Listen for message unpinned events
  onMessageUnpinned(callback) {
    if (this.socket) {
      this.socket.on("message_unpinned", callback);
    }
  }

  // Delete a message
  deleteMessage(conversationId, messageId) {
    if (this.socket) {
      this.socket.emit("delete_message", { conversationId, messageId });
    }
  }

  // Listen for message deleted events
  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on("message_deleted", callback);
    }
  }

  // Listen for chat cleared events
  onChatCleared(callback) {
    if (this.socket) {
      this.socket.on("chat_cleared", callback);
    }
  }

  // Remove all listeners. Core app listeners (notifications, task events) are
  // re-bound immediately so feature teardown can never kill global real-time.
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.__coreListenersBound = false;
      this._bindCoreListeners();
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

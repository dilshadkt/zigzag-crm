// Static data for messenger (fallback/demo data)

export const INITIAL_GROUP_MESSAGES = {
  1: [
    // Medical App Team
    {
      id: 1,
      sender: "Olive Dixon",
      time: "12:04 AM",
      message: "Hi, Evan! Nice to meet you too",
      avatar: "/api/placeholder/32/32",
      timestamp: new Date("2024-09-08T00:04:00"),
    },
    {
      id: 2,
      sender: "Olive Dixon",
      time: "12:04 AM",
      message:
        "I will send you all the files I have for this project. After that, we can call and discuss. I will answer all your questions! OK?",
      avatar: "/api/placeholder/32/32",
      timestamp: new Date("2024-09-08T00:04:30"),
    },
    {
      id: 3,
      sender: "You",
      time: "12:15 AM",
      message: "Hi, Oscar! Nice to meet you",
      isOwn: true,
      timestamp: new Date("2024-09-08T00:15:00"),
    },
    {
      id: 4,
      sender: "You",
      time: "12:15 AM",
      message: "We will work with new project together",
      isOwn: true,
      timestamp: new Date("2024-09-08T00:15:30"),
    },
    {
      id: 5,
      sender: "Olive Dixon",
      time: "12:04 AM",
      message: "Hi! Please, change the status in this task",
      avatar: "/api/placeholder/32/32",
      timestamp: new Date("2024-09-08T00:16:00"),
    },
    {
      id: 6,
      sender: "System",
      time: "12:04 AM",
      message: "UX Login + Registration",
      isLink: true,
      linkColor: "text-cyan-500",
      timestamp: new Date("2024-09-08T00:16:30"),
    },
    {
      id: 7,
      sender: "You",
      time: "12:15 AM",
      message: "Hi, Oscar! Nice to meet you",
      isOwn: true,
      timestamp: new Date("2024-09-08T00:17:00"),
    },
    {
      id: 8,
      sender: "You",
      time: "12:15 AM",
      message: "We will work with new project together",
      isOwn: true,
      timestamp: new Date("2024-09-08T00:17:30"),
    },
    {
      id: 9,
      sender: "Olive Dixon",
      time: "12:04 AM",
      message: "Ok",
      avatar: "/api/placeholder/32/32",
      timestamp: new Date("2024-09-08T00:18:00"),
    },
  ],
};

export const CONVERSATIONS_DATA = [
  {
    type: "group",
    title: "Groups",
    items: [
      {
        id: 1,
        name: "Medical App Team",
        lastMessage: "Caroline: Hi guys! I've shared yo...",
        time: "12:04",
        unread: 12,
        avatar: "🏥",
        bgColor: "bg-teal-500",
      },
      {
        id: 2,
        name: "Food Delivery Service",
        lastMessage: "Olive: Hi guys! I've shared yo...",
        time: "12:04",
        unread: 8,
        avatar: "🍕",
        bgColor: "bg-orange-500",
      },
    ],
  },
  {
    type: "direct",
    title: "Direct Messages",
    items: [
      {
        id: 3,
        name: "Garrett Watson",
        lastMessage: "Hi! Please, change the statu...",
        time: "12:04",
        avatar: "/api/placeholder/32/32",
      },
      {
        id: 4,
        name: "Caroline Santos",
        lastMessage: "Hi! Please, change the statu...",
        time: "12:04",
        avatar: "/api/placeholder/32/32",
      },
      {
        id: 5,
        name: "Leon Nunez",
        lastMessage: "Hi! Please, change the statu...",
        time: "12:04",
        avatar: "/api/placeholder/32/32",
      },
      {
        id: 6,
        name: "Oscar Holloway",
        lastMessage: "Hi! Please, change the statu...",
        time: "12:04",
        avatar: "/api/placeholder/32/32",
      },
      {
        id: 7,
        name: "Ralph Harris",
        lastMessage: "Hi! Please, change the statu...",
        time: "12:04",
        avatar: "/api/placeholder/32/32",
      },
    ],
  },
];

// Utility functions for data transformation
export const transformConversationData = (apiConversations, currentUserId) => {
  const groups = [];
  const directs = [];

  // Helper function to safely extract last message content
  const getLastMessageContent = (lastMessage) => {
    if (!lastMessage) return "";
    if (typeof lastMessage === "string") return lastMessage;
    if (typeof lastMessage === "object" && lastMessage.content) {
      return lastMessage.content;
    }
    return "";
  };

  // Helper function to safely extract last message time
  const getLastMessageTime = (lastMessage) => {
    if (!lastMessage) return "";
    if (typeof lastMessage === "object" && lastMessage.createdAt) {
      return formatTime(lastMessage.createdAt);
    }
    return "";
  };

  // Helper function to compare user IDs (handles string vs ObjectId comparison)
  const isSameUser = (id1, id2) => {
    if (!id1 || !id2) return false;
    return String(id1) === String(id2);
  };

  // Helper function to get the "other" user in a direct conversation
  const getOtherUser = (participants, currentUserId) => {
    // First, try to find a user that's definitely not the current user
    const otherUser = participants.find((p) => {
      const participantId = p._id || p.id;
      return !isSameUser(participantId, currentUserId);
    });

    if (otherUser) {
      return otherUser;
    }

    // If we can't find a different user (maybe testing with same account),
    // or if the current user ID is wrong, use the first participant
    return participants[0];
  };

  apiConversations.forEach((conv) => {
    if (conv.type === "project") {
      groups.push({
        id: conv._id || conv.id,
        name: conv.name || conv.project?.name,
        lastMessage: getLastMessageContent(conv.lastMessage),
        time: getLastMessageTime(conv.lastMessage),
        unread: conv.unreadCount || 0,
        avatar: conv.project?.emoji || "📁",
        bgColor: conv.project?.color || "bg-blue-500",
        isGroup: true,
        projectId: conv.project?._id || conv.project?.id,
      });
    } else if (conv.type === "direct") {
      // Ensure participants is an array and has at least 1 user
      if (!Array.isArray(conv.participants) || conv.participants.length < 1) {
        return;
      }

      // Get the user to display (preferably the "other" user)
      const userToDisplay = getOtherUser(conv.participants, currentUserId);

      const userName = userToDisplay
        ? `${userToDisplay.firstName || ""} ${
            userToDisplay.lastName || ""
          }`.trim()
        : "Unknown User";

      const transformedDirect = {
        id: conv._id || conv.id,
        name: userName,
        lastMessage: getLastMessageContent(conv.lastMessage),
        time: getLastMessageTime(conv.lastMessage),
        unread: conv.unreadCount || 0,
        avatar: userToDisplay?.profileImage || "/api/placeholder/32/32",
        isGroup: false,
        userId: userToDisplay?._id || userToDisplay?.id,
        isOnline: userToDisplay?.isOnline || false,
      };

      directs.push(transformedDirect);
    }
  });

  return [
    {
      type: "group",
      title: "Project Chats",
      items: groups,
    },
    {
      type: "direct",
      title: "Direct Messages",
      items: directs,
    },
  ];
};

export const transformMessageData = (apiMessages, currentUserId) => {
  return apiMessages.map((msg) => {
    const senderName = msg.sender
      ? `${msg.sender.firstName || ""} ${msg.sender.lastName || ""}`.trim()
      : "Unknown";

    // System messages should never be considered "own" messages
    const isOwn =
      msg.type === "system"
        ? false
        : (msg.sender?._id || msg.sender?.id) === currentUserId;

    // Determine message status for own messages
    let messageStatus = "sent"; // Default status
    if (isOwn && msg.readBy && Array.isArray(msg.readBy)) {
      // Check if message has been read by others (excluding sender)
      const readByOthers = msg.readBy.filter(
        (readEntry) =>
          (readEntry.user?._id || readEntry.user?.id || readEntry.user) !==
          currentUserId
      );

      if (readByOthers.length > 0) {
        messageStatus = "read";
      } else if (msg.readBy.length > 0) {
        // Message is delivered (at least sender has it)
        messageStatus = "delivered";
      }
    }

    return {
      id: msg._id || msg.id,
      sender: senderName,
      time: formatTime(msg.createdAt),
      message: msg.content,
      avatar: msg.sender?.profileImage || "/api/placeholder/32/32",
      timestamp: new Date(msg.createdAt),
      isOwn,
      isLink: msg.type === "link",
      linkColor: msg.type === "link" ? "text-cyan-500" : undefined,
      attachments: msg.attachments || [],
      status: messageStatus,
      readBy: msg.readBy || [],
      type: msg.type || "text",
      isPinned: msg.isPinned || false,
      pinnedBy: msg.pinnedBy,
      pinnedAt: msg.pinnedAt,
      mentions: msg.mentions || [],
      replyTo: msg.replyTo || null, // Include reply reference
      metadata: msg.metadata || {}, // Include metadata for system messages
    };
  });
};

// Helper functions
const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

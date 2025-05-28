const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Project = require("../models/Project");

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("project", "name emoji color")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          "readBy.user": { $ne: userId },
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      content,
      type = "text",
      attachments = [],
    } = req.body;
    const userId = req.user.id;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      type,
      attachments,
      readBy: [{ user: userId }], // Mark as read by sender
    });

    await message.save();
    await message.populate("sender", "name email avatar");

    // Update conversation last message and activity
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Emit to socket for real-time delivery
    req.io.to(`conversation_${conversationId}`).emit("new_message", {
      ...message.toObject(),
      conversationId,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    // Update all unread messages in conversation
    await Message.updateMany(
      {
        conversation: conversationId,
        "readBy.user": { $ne: userId },
      },
      {
        $push: {
          readBy: { user: userId, readAt: new Date() },
        },
      }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// Get project chat conversations
exports.getProjectChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const projectChats = await Conversation.find({
      type: "project",
      participants: userId,
    })
      .populate("project", "name emoji color")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.json(projectChats);
  } catch (error) {
    console.error("Error fetching project chats:", error);
    res.status(500).json({ message: "Failed to fetch project chats" });
  }
};

// Get direct message conversations
exports.getDirectMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const directMessages = await Conversation.find({
      type: "direct",
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.json(directMessages);
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    res.status(500).json({ message: "Failed to fetch direct messages" });
  }
};

// Create new direct conversation
exports.createDirectConversation = async (req, res) => {
  try {
    const { userId: targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId) {
      return res
        .status(400)
        .json({ message: "Cannot create conversation with yourself" });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [currentUserId, targetUserId] },
    }).populate("participants", "name email avatar");

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = new Conversation({
      type: "direct",
      participants: [currentUserId, targetUserId],
    });

    await conversation.save();
    await conversation.populate("participants", "name email avatar");

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating direct conversation:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

// Create project conversation (called when project is created)
exports.createProjectConversation = async (projectId, members) => {
  try {
    const conversation = new Conversation({
      type: "project",
      project: projectId,
      participants: members,
    });

    await conversation.save();
    return conversation;
  } catch (error) {
    console.error("Error creating project conversation:", error);
    throw error;
  }
};

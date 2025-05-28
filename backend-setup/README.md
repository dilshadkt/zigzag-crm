# Real-Time Chat Backend Setup

This guide will help you set up the backend for the real-time chat system in your CRM application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB or PostgreSQL database
- Redis (for session management and real-time features)

## Backend Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── projectController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── socketAuth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── projects.js
│   │   └── users.js
│   ├── socket/
│   │   ├── chatHandlers.js
│   │   └── socketManager.js
│   ├── utils/
│   │   ├── database.js
│   │   └── redis.js
│   └── app.js
├── package.json
└── server.js
```

## Installation

1. Create a new backend directory:

```bash
mkdir crm-backend
cd crm-backend
npm init -y
```

2. Install required dependencies:

```bash
npm install express socket.io mongoose bcryptjs jsonwebtoken cors dotenv multer
npm install -D nodemon
```

## Environment Variables

Create a `.env` file in your backend root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-chat
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
NODE_ENV=development
UPLOAD_PATH=./uploads
```

## Database Models

### User Model (MongoDB/Mongoose)

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

### Project Model

```javascript
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    emoji: { type: String, default: "📁" },
    color: { type: String, default: "bg-blue-500" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
```

### Conversation Model

```javascript
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["direct", "project"], required: true },
    name: { type: String }, // For project chats
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // For project chats
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
```

### Message Model

```javascript
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "file", "image", "link"],
      default: "text",
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
```

## API Endpoints

### Chat Routes (`/api/chat`)

- `GET /conversations` - Get all conversations for current user
- `GET /messages/:conversationId` - Get messages for a conversation
- `POST /send` - Send a new message
- `POST /mark-read` - Mark messages as read
- `GET /project` - Get project chat conversations
- `GET /direct` - Get direct message conversations
- `POST /direct/create` - Create new direct conversation

### Socket Events

#### Client to Server:

- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `mark_as_read` - Mark messages as read

#### Server to Client:

- `new_message` - New message received
- `message_update` - Message updated (read status, etc.)
- `user_typing` - User typing indicator
- `user_online` - User came online
- `user_offline` - User went offline
- `conversation_update` - Conversation updated

## Key Features Implemented

1. **Real-time messaging** with Socket.IO
2. **Project-based group chats** linked to CRM projects
3. **Direct messaging** between employees
4. **Online status tracking**
5. **Typing indicators**
6. **Message read receipts**
7. **File upload support**
8. **Message persistence**
9. **Conversation management**
10. **Authentication & authorization**

## Security Features

- JWT-based authentication
- Socket authentication middleware
- Input validation and sanitization
- File upload restrictions
- Rate limiting for messages
- CORS configuration

## Deployment Considerations

1. **Database**: Use MongoDB Atlas or AWS DocumentDB for production
2. **Redis**: Use Redis Cloud or AWS ElastiCache
3. **File Storage**: Use AWS S3 or similar for file uploads
4. **Environment**: Use PM2 for process management
5. **SSL**: Enable HTTPS for production
6. **Monitoring**: Add logging and monitoring tools

## Next Steps

1. Set up the backend server using the provided structure
2. Configure your database connections
3. Implement the API endpoints
4. Set up Socket.IO handlers
5. Test the integration with your frontend
6. Deploy to your preferred hosting platform

## Testing

Use tools like:

- Postman for API testing
- Socket.IO client for real-time testing
- Jest for unit testing
- Supertest for integration testing

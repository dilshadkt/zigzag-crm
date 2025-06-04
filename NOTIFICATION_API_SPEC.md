# Notification System API Specification

## Overview

This document outlines the API endpoints needed to implement a comprehensive notification system for the CRM application. The system will handle various types of notifications including task assignments, messages, project updates, and deadline reminders.

## Database Schema

### Notification Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Recipient of the notification
  type: String, // 'task_assigned', 'message', 'task_updated', 'deadline_reminder', 'project_update', 'comment'
  title: String, // Short title for the notification
  message: String, // Detailed message
  data: Object, // Type-specific data (see below)
  read: Boolean, // Whether the notification has been read
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId, // User who triggered the notification (optional)
}
```

### Data Structure by Type

#### task_assigned

```javascript
data: {
  taskId: ObjectId,
  taskTitle: String,
  projectId: ObjectId,
  projectName: String,
  assignedBy: {
    _id: ObjectId,
    name: String,
    profileImage: String
  },
  dueDate: Date,
  priority: String
}
```

#### message

```javascript
data: {
  senderId: ObjectId,
  senderName: String,
  senderImage: String,
  conversationId: ObjectId,
  messagePreview: String, // First 100 characters
  projectId: ObjectId, // If it's a project conversation
  projectName: String
}
```

#### task_updated

```javascript
data: {
  taskId: ObjectId,
  taskTitle: String,
  projectId: ObjectId,
  projectName: String,
  updatedBy: {
    _id: ObjectId,
    name: String,
    profileImage: String
  },
  oldStatus: String,
  newStatus: String,
  field: String // What was updated: status, priority, dueDate, etc.
}
```

#### deadline_reminder

```javascript
data: {
  taskId: ObjectId,
  taskTitle: String,
  projectId: ObjectId,
  projectName: String,
  dueDate: Date,
  hoursUntilDue: Number
}
```

#### project_update

```javascript
data: {
  projectId: ObjectId,
  projectName: String,
  updatedBy: {
    _id: ObjectId,
    name: String,
    profileImage: String
  },
  oldProgress: Number,
  newProgress: Number,
  field: String // progress, status, deadline, etc.
}
```

#### comment

```javascript
data: {
  taskId: ObjectId,
  taskTitle: String,
  projectId: ObjectId,
  projectName: String,
  commentBy: {
    _id: ObjectId,
    name: String,
    profileImage: String
  },
  commentPreview: String
}
```

## API Endpoints

### GET /api/notifications

Get notifications for the authenticated user.

**Query Parameters:**

- `limit` (optional): Number of notifications to return (default: 20, max: 100)
- `offset` (optional): Number of notifications to skip (default: 0)
- `type` (optional): Filter by notification type
- `unread` (optional): Boolean to filter unread notifications only

**Response:**

```javascript
{
  success: true,
  notifications: [
    {
      _id: "notification_id",
      type: "task_assigned",
      title: "New Task Assigned",
      message: "You have been assigned to 'Review project requirements'",
      data: {
        // Type-specific data
      },
      read: false,
      createdAt: "2024-01-15T10:30:00Z",
      createdBy: {
        _id: "user_id",
        name: "John Smith",
        profileImage: "url"
      }
    }
  ],
  totalCount: 45,
  unreadCount: 3,
  hasMore: true
}
```

### GET /api/notifications/unread-count

Get the count of unread notifications for the authenticated user.

**Response:**

```javascript
{
  success: true,
  count: 3
}
```

### PATCH /api/notifications/:id/read

Mark a specific notification as read.

**Response:**

```javascript
{
  success: true,
  message: "Notification marked as read"
}
```

### PATCH /api/notifications/mark-all-read

Mark all notifications as read for the authenticated user.

**Response:**

```javascript
{
  success: true,
  message: "All notifications marked as read",
  updatedCount: 5
}
```

### DELETE /api/notifications/:id

Delete a specific notification.

**Response:**

```javascript
{
  success: true,
  message: "Notification deleted"
}
```

### POST /api/notifications (Internal/System Use)

Create a new notification (used by system events).

**Request Body:**

```javascript
{
  userId: "user_id",
  type: "task_assigned",
  title: "New Task Assigned",
  message: "You have been assigned to 'Review project requirements'",
  data: {
    // Type-specific data
  },
  createdBy: "creator_user_id" // optional
}
```

## Implementation Guide

### 1. Notification Triggers

#### Task Assignment

```javascript
// When a task is assigned to a user
const createTaskAssignmentNotification = async (
  taskId,
  assigneeId,
  assignedById
) => {
  const task = await Task.findById(taskId).populate("project");
  const assignedBy = await User.findById(assignedById);

  await createNotification({
    userId: assigneeId,
    type: "task_assigned",
    title: "New Task Assigned",
    message: `You have been assigned to '${task.title}' in ${task.project.name}`,
    data: {
      taskId: task._id,
      taskTitle: task.title,
      projectId: task.project._id,
      projectName: task.project.name,
      assignedBy: {
        _id: assignedBy._id,
        name: `${assignedBy.firstName} ${assignedBy.lastName}`,
        profileImage: assignedBy.profileImage,
      },
      dueDate: task.dueDate,
      priority: task.priority,
    },
    createdBy: assignedById,
  });
};
```

#### Message Notification

```javascript
// When a message is sent
const createMessageNotification = async (messageData, recipients) => {
  const sender = await User.findById(messageData.senderId);

  for (const recipientId of recipients) {
    if (recipientId !== messageData.senderId) {
      // Don't notify sender
      await createNotification({
        userId: recipientId,
        type: "message",
        title: "New Message",
        message: `${sender.firstName} ${sender.lastName} sent you a message`,
        data: {
          senderId: sender._id,
          senderName: `${sender.firstName} ${sender.lastName}`,
          senderImage: sender.profileImage,
          conversationId: messageData.conversationId,
          messagePreview: messageData.content.substring(0, 100),
        },
        createdBy: messageData.senderId,
      });
    }
  }
};
```

#### Deadline Reminder

```javascript
// Cron job to check for upcoming deadlines
const checkDeadlineReminders = async () => {
  const upcomingTasks = await Task.find({
    dueDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
    },
    status: { $ne: "completed" },
  }).populate("assignedTo project");

  for (const task of upcomingTasks) {
    const hoursUntilDue = Math.ceil(
      (task.dueDate - new Date()) / (1000 * 60 * 60)
    );

    await createNotification({
      userId: task.assignedTo._id,
      type: "deadline_reminder",
      title: "Deadline Reminder",
      message: `Task '${task.title}' is due in ${hoursUntilDue} hours`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project._id,
        projectName: task.project.name,
        dueDate: task.dueDate,
        hoursUntilDue,
      },
    });
  }
};
```

### 2. Helper Function

```javascript
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Optional: Send real-time notification via WebSocket
    if (io) {
      io.to(`user_${notificationData.userId}`).emit(
        "new_notification",
        notification
      );
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
```

### 3. Integration Points

Add notification creation to existing endpoints:

- Task creation/assignment: `POST /api/tasks`
- Task updates: `PATCH /api/tasks/:id`
- Message sending: `POST /api/messages`
- Project updates: `PATCH /api/projects/:id`
- Comment creation: `POST /api/comments`

### 4. Real-time Updates (Optional)

Implement WebSocket connections to send real-time notifications:

```javascript
// When user connects
socket.join(`user_${userId}`);

// Send notification in real-time
io.to(`user_${userId}`).emit("new_notification", notificationData);
```

## Testing

Create test cases for:

1. Notification creation for each type
2. Marking notifications as read
3. Filtering notifications
4. Real-time notification delivery
5. Notification cleanup (optional: delete old notifications)

## Security Considerations

1. Users can only access their own notifications
2. Validate notification data before creation
3. Rate limiting on notification creation to prevent spam
4. Sanitize notification content to prevent XSS

## Performance Optimizations

1. Index on `userId` and `createdAt` for efficient queries
2. Consider pagination for large notification lists
3. Cache unread notification counts
4. Archive old notifications (older than 3-6 months)

# Chat System Troubleshooting Guide

## Issues Fixed

### 1. New Conversation Showing Wrong User Details

**Problem**: When creating a new conversation, it shows the current user's details instead of the selected employee.

**Root Cause**: Data transformation issue in the `createDirectConversation` function.

**Fix Applied**: Updated the `useChat.js` hook to properly transform conversation data and identify the "other user" in the conversation.

### 2. Chat Not Real-time

**Problem**: Messages don't appear in real-time and only show after refresh.

**Root Causes**:

- Socket connection issues
- Message broadcasting problems
- Event listener setup issues

**Fixes Applied**:

- Enhanced socket debugging and error handling
- Fixed user data formatting in socket handlers
- Added comprehensive logging for message flow
- Fixed API response formats

### 3. Only Seeing Own Messages Until Refresh

**Problem**: Users can only see their own messages until they refresh the page.

**Root Cause**: Real-time message broadcasting not working properly.

**Fix Applied**: Enhanced socket message handling and broadcasting.

## Debugging Steps

### Step 1: Check Socket Connection

1. Open the Messenger page
2. Look at the Socket Debugger component at the top
3. Check if the status shows "CONNECTED"
4. If not connected, check the browser console for errors

### Step 2: Test Message Sending

1. Use the test message input in the Socket Debugger
2. Send a test message
3. Check the debug logs for any errors
4. Look for "Message sent successfully" logs

### Step 3: Check Backend Logs

1. Start the backend server: `npm start`
2. Watch the console for socket connection logs
3. Look for user connection messages
4. Check for message processing logs

### Step 4: Test Real Conversation

1. Create a new conversation with an employee
2. Send a message
3. Check if the message appears immediately
4. Open another browser/incognito window with a different user
5. Check if messages appear in real-time

## Common Issues and Solutions

### Issue: Socket Connection Failed

**Symptoms**: Status shows "DISCONNECTED" or "ERROR"
**Solutions**:

- Check if backend server is running on port 5000
- Verify JWT token is valid
- Check CORS settings in server.js
- Ensure Socket.IO is properly configured

### Issue: Messages Not Broadcasting

**Symptoms**: Messages save but don't appear in real-time
**Solutions**:

- Check if users are joining conversation rooms
- Verify conversation IDs are correct
- Check socket room broadcasting logic
- Ensure message format is correct

### Issue: User Data Not Showing Correctly

**Symptoms**: Wrong user names/avatars in conversations
**Solutions**:

- Check data transformation in useChat hook
- Verify user population in backend queries
- Check participant identification logic

## Debug Commands

### Backend Debug Script

```bash
cd CRM-API
node test-chat-debug.js
```

### Frontend Console Commands

```javascript
// Check socket connection
socketService.isSocketConnected();

// Get socket instance
socketService.getSocket();

// Check local storage
localStorage.getItem("token");
JSON.parse(localStorage.getItem("user"));
```

## Files Modified for Fixes

### Frontend:

- `src/hooks/useChat.js` - Fixed conversation creation and message handling
- `src/services/socketService.js` - Enhanced debugging and error handling
- `src/components/messenger/SocketDebugger.jsx` - Added debug component

### Backend:

- `CRM-API/socket/chatHandlers.js` - Fixed user data formatting and message broadcasting
- `CRM-API/controllers/chatController.js` - Fixed API response formats
- `CRM-API/test-chat-debug.js` - Added debug script

## Next Steps

1. **Test the Socket Debugger**: Check if socket connects properly
2. **Test Message Flow**: Send messages and verify real-time delivery
3. **Test Multiple Users**: Use different browsers to test real-time chat
4. **Remove Debug Component**: Once issues are resolved, remove SocketDebugger from messenger page

## Contact for Support

If issues persist, check:

1. Browser console for JavaScript errors
2. Network tab for failed API requests
3. Backend console for server errors
4. Database connectivity

The debug components and enhanced logging should help identify the exact issue causing the chat problems.

# Messenger Components

This folder contains all the modular components for the messenger feature of the CRM application.

## Component Structure

```
messenger/
├── index.js                 # Main export file for all components
├── data.js                  # Static data (conversations, initial messages)
├── ConversationList.jsx     # Left sidebar with conversation list
├── ChatWindow.jsx           # Main chat area container
├── ChatHeader.jsx           # Chat header with conversation info
├── MessageBubble.jsx        # Individual message component
├── TypingIndicator.jsx      # Typing animation component
├── ChatInput.jsx            # Message input area
├── ConversationItem.jsx     # Individual conversation item
├── SectionHeader.jsx        # Collapsible section headers
└── README.md               # This documentation file
```

## Components Overview

### Main Components

- **ConversationList**: Left sidebar containing all conversations organized by Groups and Direct Messages
- **ChatWindow**: Main chat interface containing header, messages, and input

### Sub Components

- **ChatHeader**: Top bar of chat with conversation info and action buttons
- **MessageBubble**: Individual message display with different styles for own/other messages
- **TypingIndicator**: Animated typing indicator when someone is typing
- **ChatInput**: Message input field with send button and attachment options
- **ConversationItem**: Individual conversation item in the sidebar
- **SectionHeader**: Collapsible section headers for Groups/Direct Messages

### Data

- **data.js**: Contains static data for conversations and initial messages

## Usage

Import components from the main index file:

```jsx
import { ConversationList, ChatWindow } from "../../components/messenger";
```

Or import individual components:

```jsx
import ConversationList from "../../components/messenger/ConversationList";
import ChatWindow from "../../components/messenger/ChatWindow";
```

## Features

- ✅ Collapsible conversation sections
- ✅ Real-time messaging with typing indicators
- ✅ Message persistence across conversations
- ✅ Auto-scroll to latest messages
- ✅ Responsive design
- ✅ Group and direct message support
- ✅ Unread message counters
- ✅ Interactive message input with character counter

## Props

### ConversationList

- `collapsedSections`: Object tracking which sections are collapsed
- `onToggleSection`: Function to toggle section collapse state
- `selectedConversation`: Currently selected conversation object
- `onSelectConversation`: Function to handle conversation selection

### ChatWindow

- `selectedConversation`: Currently selected conversation object
- `messageInput`: Current message input value
- `onInputChange`: Function to handle input changes
- `onKeyPress`: Function to handle keyboard events
- `onSendMessage`: Function to send messages
- `isTyping`: Boolean indicating if someone is typing
- `messagesEndRef`: Ref for auto-scrolling to bottom

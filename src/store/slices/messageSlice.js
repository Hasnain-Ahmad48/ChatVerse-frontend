import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chatService';

/**
 * Async thunk to fetch messages
 */
export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async ({ chatId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(chatId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch messages'
      );
    }
  }
);

const initialState = {
  messages: {},
  typingUsers: {},
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    /**
     * Add a new message (optimistic UI)
     * Used for real-time message updates
     */
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      // Normalize message data - convert Date objects to ISO strings
      const normalizedMessage = {
        ...message,
        createdAt: message.createdAt ? (message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt) : new Date().toISOString(),
        readAt: message.readAt ? (message.readAt instanceof Date ? message.readAt.toISOString() : message.readAt) : null,
      };

      // Normalize IDs to strings for reliable comparison
      const incomingId = normalizedMessage._id ? normalizedMessage._id.toString() : null;
      const incomingClientId = normalizedMessage.clientId || null;
      const incomingSenderId = normalizedMessage.senderId?._id ? normalizedMessage.senderId._id.toString() : (normalizedMessage.senderId ? normalizedMessage.senderId.toString() : null);
      const incomingText = normalizedMessage.text || '';
      const incomingCreatedAt = normalizedMessage.createdAt;

      // Find existing message by _id, clientId, or by content (for deduplication)
      const existingIndex = state.messages[chatId].findIndex((m) => {
        const mid = m._id ? m._id.toString() : null;
        const mClientId = m.clientId || null;
        const mSenderId = m.senderId?._id ? m.senderId._id.toString() : (m.senderId ? m.senderId.toString() : null);
        const mText = m.text || '';
        const mCreatedAt = m.createdAt;
        
        // Match by MongoDB _id (exact match) - highest priority
        if (incomingId && mid && mid === incomingId) {
          return true;
        }
        
        // Match by clientId (for optimistic UI deduplication)
        if (incomingClientId && mClientId && mClientId === incomingClientId) {
          return true;
        }
        
        // Match optimistic message by clientId stored in _id
        if (incomingId && mClientId && incomingId === mClientId) {
          return true;
        }
        
        // Match if optimistic _id matches incoming clientId
        if (incomingClientId && mid && mid === incomingClientId) {
          return true;
        }
        
        // Match by content + sender + time (within 2 seconds) - catch duplicates
        if (incomingText && mText && 
            incomingText === mText && 
            incomingSenderId && mSenderId && 
            incomingSenderId === mSenderId &&
            incomingCreatedAt && mCreatedAt) {
          const timeDiff = Math.abs(new Date(incomingCreatedAt).getTime() - new Date(mCreatedAt).getTime());
          if (timeDiff < 2000) { // Within 2 seconds
            return true;
          }
        }
        
        return false;
      });

      if (existingIndex !== -1) {
        // Replace existing message with new one (server message takes precedence)
        state.messages[chatId][existingIndex] = normalizedMessage;
      } else {
        // Only add if it doesn't exist
        state.messages[chatId].push(normalizedMessage);
      }
    },
    /**
     * Set messages for a chat
     * Used when loading message history
     */
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    /**
     * Update message status (sent -> delivered -> read)
     */
    updateMessageStatus: (state, action) => {
      const { chatId, messageId, status } = action.payload;
      if (state.messages[chatId]) {
        const message = state.messages[chatId].find((m) => {
          const mid = m._id?.toString() || m._id;
          const targetId = messageId?.toString() || messageId;
          return mid === targetId;
        });
        if (message) {
          message.status = status;
          if (status === 'read') {
            message.readAt = new Date().toISOString(); // Store as ISO string, not Date object
          }
        }
      }
    },
    /**
     * Mark messages as read
     */
    markMessagesAsRead: (state, action) => {
      const { chatId, messageIds } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId].forEach((message) => {
          const messageId = message._id?.toString() || message._id;
          if (messageIds.some(id => (id?.toString() || id) === messageId)) {
            message.status = 'read';
            message.readAt = new Date().toISOString(); // Store as ISO string, not Date object
          }
        });
      }
    },
    /**
     * Set typing indicator
     */
    setTyping: (state, action) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = {};
      }
      if (isTyping) {
        state.typingUsers[chatId][userId] = true;
      } else {
        delete state.typingUsers[chatId][userId];
      }
    },
    /**
     * Clear messages for a chat
     */
    clearMessages: (state, action) => {
      const chatId = action.payload;
      delete state.messages[chatId];
      delete state.typingUsers[chatId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { messages, pagination } = action.payload;
        const chatId = action.meta.arg.chatId;

        // Normalize dates to ISO strings
        const normalizedMessages = messages.map(msg => ({
          ...msg,
          createdAt: msg.createdAt ? (msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt) : new Date().toISOString(),
          readAt: msg.readAt ? (msg.readAt instanceof Date ? msg.readAt.toISOString() : msg.readAt) : null,
        }));

        if (pagination.page === 1) {
          // First page - replace messages
          state.messages[chatId] = normalizedMessages;
        } else {
          // Subsequent pages - prepend messages
          state.messages[chatId] = [...normalizedMessages, ...(state.messages[chatId] || [])];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addMessage,
  setMessages,
  updateMessageStatus,
  markMessagesAsRead,
  setTyping,
  clearMessages,
} = messageSlice.actions;
export default messageSlice.reducer;


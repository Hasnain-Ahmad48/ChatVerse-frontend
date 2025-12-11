import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';

/**
 * Async thunk to get or create chat
 */
export const getOrCreateChat = createAsyncThunk(
  'chat/getOrCreateChat',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await chatService.getOrCreateChat(userId);
      return response.data.chat;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get chat'
      );
    }
  }
);

/**
 * Async thunk to get user chats list
 */
export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserChats();
      return response.data.chats || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chats'
      );
    }
  }
);

const initialState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    updateChatLastMessage: (state, action) => {
      const { chatId, lastMessage } = action.payload;
      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) {
        chat.lastMessage = lastMessage;
        chat.lastMessageAt = new Date();
      }
    },
    addChat: (state, action) => {
      const exists = state.chats.find((c) => c._id === action.payload._id);
      if (!exists) {
        state.chats.unshift(action.payload);
      }
    },
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      state.chats.forEach((chat) => {
        if (chat.user?._id === userId) {
          chat.user.isOnline = isOnline;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrCreateChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
      })
      .addCase(getOrCreateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentChat,
  updateChatLastMessage,
  addChat,
  updateUserOnlineStatus,
} = chatSlice.actions;
export default chatSlice.reducer;


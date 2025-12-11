import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice';
import userReducer from './slices/userSlice';

/**
 * Redux Store Configuration
 * 
 * Why Redux Toolkit was chosen:
 * - Centralized state management for complex app state
 * - Predictable state updates with reducers
 * - DevTools integration for debugging
 * - Better performance with memoization
 * - Easier to manage async operations with createAsyncThunk
 * - Scales well as app grows
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    message: messageReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['message/addMessage', 'message/setMessages'],
      },
    }),
});





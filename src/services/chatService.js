import api from './api';

/**
 * Chat Service
 * Handles all chat-related API calls
 */

export const chatService = {
  /**
   * Get or create chat with a user
   */
  getOrCreateChat: async (userId) => {
    const response = await api.get(`/chats/${userId}`);
    return response.data;
  },

  /**
   * Get messages for a chat
   */
  getMessages: async (chatId, page = 1, limit = 20) => {
    const response = await api.get(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Mark messages as read
   */
  markMessagesAsRead: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/messages/read`);
    return response.data;
  },
};





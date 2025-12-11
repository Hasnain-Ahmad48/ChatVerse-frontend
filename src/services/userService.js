import api from './api';

/**
 * User Service
 * Handles all user-related API calls
 */

export const userService = {
  /**
   * Search users
   */
  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Get user chats list
   */
  getUserChats: async () => {
    const response = await api.get('/users/chats');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};





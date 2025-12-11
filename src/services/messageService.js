import api from './api';

/**
 * Message Service
 * Handles all message-related API calls
 */

export const messageService = {
  /**
   * Send a message
   */
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
};





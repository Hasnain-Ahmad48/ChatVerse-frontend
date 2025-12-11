import api from './api';

/**
 * Upload Service
 * Handles file uploads to Cloudinary
 */

export const uploadService = {
  /**
   * Upload image
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};





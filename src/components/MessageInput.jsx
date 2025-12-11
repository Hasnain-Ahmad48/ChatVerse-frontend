import React, { useState, useRef, useCallback, useEffect } from 'react';
import { uploadService } from '../services/uploadService';

/**
 * MessageInput Component
 * Handles message input with typing indicators and image upload
 * 
 * Why useRef:
 * - Stores reference to file input element
 * - Allows programmatic file input trigger
 * - Doesn't cause re-renders when ref changes
 * 
 * Why useCallback:
 * - Memoizes event handlers
 * - Prevents unnecessary re-renders of parent
 * - Stable function references
 */
const MessageInput = ({
  chatId,
  receiverId,
  onSendMessage,
  onTyping,
  onStopTyping,
}) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Store selected image URL
  const [selectedFile, setSelectedFile] = useState(null); // Store selected file for upload
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle text change with typing indicator
  const handleTextChange = useCallback(
    (e) => {
      setText(e.target.value);

      // Emit typing indicator
      if (onTyping) {
        onTyping();
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 1000);
    },
    [onTyping, onStopTyping]
  );

  // Handle send message
  const handleSend = useCallback(
    async (messageText = '', mediaURL = '', mediaType = '') => {
      // If there's a selected file, upload it first
      if (selectedFile && !mediaURL) {
        setUploading(true);
        try {
          const response = await uploadService.uploadImage(selectedFile);
          if (response.success && response.data && response.data.url) {
            mediaURL = response.data.url;
            mediaType = 'image';
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Failed to upload image. Please check your Cloudinary configuration in the server .env file.';
          alert(errorMessage);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      if (!messageText.trim() && !mediaURL) return;

      const messageData = {
        chatId,
        receiverId,
        text: messageText.trim(),
        mediaURL,
        mediaType,
      };

      // Only call onSendMessage (which handles socket sending) - removed duplicate sendMessage call
      if (onSendMessage) {
        onSendMessage(messageData);
      }

      // Clear state
      setText('');
      setSelectedImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [chatId, receiverId, onSendMessage, selectedFile, text]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      handleSend(text);
    },
    [text, handleSend]
  );

  // Handle remove selected image
  const handleRemoveImage = useCallback(() => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage); // Clean up object URL
    }
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedImage]);

  // Cleanup object URL on unmount or when image changes
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  // Handle image selection (not upload - just store for preview)
  const handleImageSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Store file for later upload
      setSelectedFile(file);
      
      // Create preview URL
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);
    },
    []
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
      {/* Image preview */}
      {selectedImage && (
        <div className="mb-2 relative inline-block">
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-xs max-h-48 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-600 hover:text-primary-500 disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-sm">Uploading...</span>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || uploading}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;





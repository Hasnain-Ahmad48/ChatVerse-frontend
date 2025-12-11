import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addMessage,
  updateMessageStatus,
  markMessagesAsRead,
  setTyping,
} from '../store/slices/messageSlice';
import { updateChatLastMessage } from '../store/slices/chatSlice';
import { updateUserOnlineStatus } from '../store/slices/chatSlice';

/**
 * Custom Hook: useSocket
 * 
 * Manages Socket.io connection and real-time events
 * 
 * Why useRef:
 * - Stores socket instance that persists across renders
 * - Prevents socket reconnection on every render
 * - Allows access to current socket instance in callbacks
 * 
 * Why useCallback:
 * - Memoizes socket event handlers
 * - Prevents unnecessary re-subscriptions
 * - Ensures stable function references
 */
export const useSocket = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const processedMessagesRef = useRef(new Set()); // Track processed message IDs

  /**
   * Initialize socket connection
   * Only connects if user is authenticated
   */
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://chatverse-23kc.onrender.com/';

    // Create socket connection with authentication
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Connection event
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    // New message event - only for messages received from others
    socket.on('new-message', (data) => {
      const { message } = data;
      // Only add if it's not from current user (to avoid duplicates)
      if (message && message._id && message.senderId) {
        const messageId = message._id.toString();
        const senderId = message.senderId._id || message.senderId;
        
        // Skip if already processed
        if (processedMessagesRef.current.has(messageId)) {
          return;
        }
        
        // Only add if message is from someone else
        if (senderId.toString() !== user?._id?.toString()) {
          processedMessagesRef.current.add(messageId);
          
          // Normalize message data before adding
          const normalizedMessage = {
            ...message,
            createdAt: message.createdAt ? (message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt) : new Date().toISOString(),
            readAt: message.readAt ? (message.readAt instanceof Date ? message.readAt.toISOString() : message.readAt) : null,
          };
          dispatch(
            addMessage({
              chatId: message.chatId,
              message: normalizedMessage,
            })
          );
          dispatch(
            updateChatLastMessage({
              chatId: message.chatId,
              lastMessage: normalizedMessage,
            })
          );
          
          // Clean up after 5 seconds to prevent memory leak
          setTimeout(() => {
            processedMessagesRef.current.delete(messageId);
          }, 5000);
        }
      }
    });

    // Message sent confirmation - add message from server
    socket.on('message-sent', (data) => {
      const { message } = data;
      // Only dispatch if we have a valid message with _id
      if (message && message._id) {
        const messageId = message._id.toString();
        // Skip if already processed
        if (processedMessagesRef.current.has(messageId)) {
          return;
        }
        processedMessagesRef.current.add(messageId);
        
        // Normalize message data before adding
        const normalizedMessage = {
          ...message,
          createdAt: message.createdAt ? (message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt) : new Date().toISOString(),
          readAt: message.readAt ? (message.readAt instanceof Date ? message.readAt.toISOString() : message.readAt) : null,
        };
        dispatch(
          addMessage({
            chatId: message.chatId,
            message: normalizedMessage,
          })
        );
        
        // Clean up after 5 seconds to prevent memory leak
        setTimeout(() => {
          processedMessagesRef.current.delete(messageId);
        }, 5000);
      }
    });

    // Messages read event
    socket.on('messages-read', (data) => {
      const { chatId, messageIds } = data;
      dispatch(
        markMessagesAsRead({
          chatId,
          messageIds,
        })
      );
    });

    // User typing event
    socket.on('user-typing', (data) => {
      const { chatId, userId, isTyping } = data;
      dispatch(
        setTyping({
          chatId,
          userId,
          isTyping,
        })
      );
    });

    // User online event
    socket.on('user-online', (data) => {
      dispatch(
        updateUserOnlineStatus({
          userId: data.userId,
          isOnline: true,
        })
      );
    });

    // User offline event
    socket.on('user-offline', (data) => {
      dispatch(
        updateUserOnlineStatus({
          userId: data.userId,
          isOnline: false,
        })
      );
    });

    // Error event
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [token, user, dispatch]);

  /**
   * Send message via socket
   * Memoized to prevent recreation
   */
  const sendMessage = useCallback(
    (messageData) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send-message', messageData);
      }
    },
    []
  );

  /**
   * Emit typing indicator
   * Memoized to prevent recreation
   */
  const emitTyping = useCallback((chatId, receiverId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { chatId, receiverId });
    }
  }, []);

  /**
   * Emit stop typing
   * Memoized to prevent recreation
   */
  const emitStopTyping = useCallback((chatId, receiverId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('stop-typing', { chatId, receiverId });
    }
  }, []);

  /**
   * Mark messages as read via socket
   * Memoized to prevent recreation
   */
  const markAsRead = useCallback((chatId, messageIds) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('mark-read', { chatId, messageIds });
    }
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markAsRead,
    isConnected: socketRef.current?.connected || false,
  };
};


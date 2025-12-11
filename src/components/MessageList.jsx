import React, { useEffect, useRef, useMemo } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useSelector } from 'react-redux';

/**
 * MessageList Component
 * Displays messages in a chat with auto-scroll
 * 
 * Why useRef:
 * - Stores reference to scrollable container
 * - Allows programmatic scrolling without re-renders
 * - Persists across renders without causing re-renders
 * 
 * Why useMemo:
 * - Memoizes currentUserId to avoid recalculation
 * - Only recalculates when auth state changes
 */
const MessageList = ({ messages, typingUsers, currentUserId, chatId }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  // Memoize current user ID
  const userId = useMemo(() => {
    return currentUserId || user?._id;
  }, [currentUserId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if any user is typing
  const isTyping = useMemo(() => {
    return Object.keys(typingUsers || {}).length > 0;
  }, [typingUsers]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-50"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {messages.map((message) => {
        const senderId = message.senderId?._id || message.senderId;
        return (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={senderId === userId}
            currentUserId={userId}
          />
        );
      })}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;


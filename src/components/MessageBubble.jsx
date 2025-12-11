import React from 'react';
import { formatMessageDate } from '../utils/formatDate';

/**
 * MessageBubble Component
 * Displays individual message with status indicators
 * 
 * Why React.memo:
 * - Messages are rendered frequently in lists
 * - Prevents re-renders when other messages change
 * - Improves scroll performance
 */
const MessageBubble = React.memo(({ message, isOwn, currentUserId }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'read') return 'text-blue-500';
    return 'text-gray-400';
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {message.mediaURL && (
          <div className="mb-2">
            <img
              src={message.mediaURL}
              alt="Message media"
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        )}
        {message.text && (
          <p className="text-sm break-words">{message.text}</p>
        )}
        <div
          className={`flex items-center justify-end mt-1 text-xs ${
            isOwn ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          <span className="mr-2">
            {formatMessageDate(message.createdAt)}
          </span>
          {isOwn && (
            <span className={getStatusColor(message.status)}>
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;


import React from 'react';

/**
 * TypingIndicator Component
 * Shows animated typing dots when user is typing
 * 
 * Why React.memo:
 * - Renders frequently during typing
 * - Prevents unnecessary re-renders
 */
const TypingIndicator = React.memo(() => {
  return (
    <div className="flex items-center px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;





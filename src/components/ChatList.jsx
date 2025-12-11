import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChat } from '../store/slices/chatSlice';
import Avatar from './Avatar';
import { formatMessageDate } from '../utils/formatDate';

/**
 * ChatList Component
 * Displays list of user chats with last message preview
 * 
 * Why useMemo:
 * - Memoizes sorted/filtered chat list
 * - Only recalculates when chats array changes
 * - Improves performance for large chat lists
 */
const ChatList = ({ chats, currentChatId }) => {
  const dispatch = useDispatch();

  // Memoize sorted chats (by lastMessageAt)
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const dateA = new Date(a.lastMessageAt || 0);
      const dateB = new Date(b.lastMessageAt || 0);
      return dateB - dateA;
    });
  }, [chats]);

  const handleChatClick = (chat) => {
    dispatch(setCurrentChat(chat));
  };

  return (
    <div className="h-full overflow-y-auto">
      {sortedChats.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No chats yet. Search for users to start chatting!
        </div>
      ) : (
        sortedChats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatClick(chat)}
            className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              currentChatId === chat._id ? 'bg-primary-50' : ''
            }`}
          >
            <Avatar user={chat.user} size="md" showOnline={true} />
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {chat.user?.name}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 ml-2">
                    {formatMessageDate(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-gray-600 truncate mt-1">
                  {chat.lastMessage.text || '📷 Image'}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;





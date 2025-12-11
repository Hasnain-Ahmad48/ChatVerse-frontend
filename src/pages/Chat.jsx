import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../hooks/useSocket';
import { useMessages } from '../hooks/useMessages';
import { fetchUserChats } from '../store/slices/chatSlice';
import ChatList from '../components/ChatList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import UserSearch from '../components/UserSearch';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Chat Page
 * Main chat interface with chat list and message window
 * 
 * Why useCallback:
 * - Memoizes event handlers
 * - Prevents unnecessary re-renders
 * - Stable function references for child components
 */
const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { chats, currentChat } = useSelector((state) => state.chat);
  // Initialize socket connection
  const { isConnected } = useSocket();

  // Fetch user chats on mount
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Get current chat details
  const currentChatUser = currentChat?.participants?.find(
    (p) => p._id !== user?._id
  ) || currentChat?.user;

  const chatId = currentChat?._id;
  const receiverId = currentChatUser?._id;

  // Use messages hook for current chat
  const {
    messages,
    typingUsers,
    sendMessage,
    handleTyping,
    handleStopTyping,
    handleMarkAsRead,
  } = useMessages(chatId);

  // Handle user selection from search
  const handleUserSelect = useCallback(() => {
    // Chat is already set by getOrCreateChat action
  }, []);

  // Handle typing
  const onTyping = useCallback(() => {
    if (receiverId) {
      handleTyping(receiverId);
    }
  }, [receiverId, handleTyping]);

  // Handle stop typing
  const onStopTyping = useCallback(() => {
    if (receiverId) {
      handleStopTyping(receiverId);
    }
  }, [receiverId, handleStopTyping]);

  // Mark messages as read when viewing chat
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((msg) => {
          const senderId = msg.senderId?._id || msg.senderId;
          return senderId === receiverId && msg.status !== 'read';
        })
        .map((msg) => msg._id);

      if (unreadMessageIds.length > 0) {
        handleMarkAsRead(unreadMessageIds);
      }
    }
  }, [chatId, messages, receiverId, handleMarkAsRead]);

  // Quick actions
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleGoLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row">
      {/* Left Panel - Chat List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-primary-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">ChatVerse</h1>
              <div className="flex items-center mt-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                ></div>
                <span>{isConnected ? 'Online' : 'Offline'}</span>
              </div>
              {user && (
                <p className="mt-2 text-sm text-white/90">
                  Logged in as <span className="font-semibold">{user.name}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={handleGoLogin}
                className="px-3 py-1 bg-white text-primary-600 rounded border border-white/50 hover:bg-primary-100 transition"
              >
                Login
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-primary-700 text-white rounded hover:bg-primary-800 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <UserSearch onUserSelect={handleUserSelect} />
        <div className="flex-1 overflow-hidden">
          <ChatList chats={chats} currentChatId={chatId} />
        </div>
      </div>

      {/* Right Panel - Message Window */}
      <div className="flex-1 flex flex-col w-full">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex items-center">
              <Avatar user={currentChatUser} size="md" showOnline={true} />
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">
                  {currentChatUser?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentChatUser?.isOnline
                    ? 'Online'
                    : `Last seen ${new Date(currentChatUser?.lastSeen).toLocaleTimeString()}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              currentUserId={user?._id}
              chatId={chatId}
            />

            {/* Message Input */}
            <MessageInput
              chatId={chatId}
              receiverId={receiverId}
              onSendMessage={sendMessage}
              onTyping={onTyping}
              onStopTyping={onStopTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Select a chat to start messaging</p>
              <p className="text-sm">Search for users above to start a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;


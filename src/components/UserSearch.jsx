import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, clearSearchResults } from '../store/slices/userSlice';
import { getOrCreateChat } from '../store/slices/chatSlice';
import Avatar from './Avatar';
// Simple debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * UserSearch Component
 * Search and select users to start a chat
 * 
 * Why useCallback:
 * - Memoizes search handler
 * - Prevents recreation on every render
 * - Used with debounce for performance
 * 
 * Why useMemo:
 * - Memoizes debounced search function
 * - Only recreates when dependencies change
 * - Improves performance by debouncing API calls
 */
const UserSearch = ({ onUserSelect }) => {
  const dispatch = useDispatch();
  const { searchResults, searchLoading } = useSelector((state) => state.user);
  const [query, setQuery] = useState('');

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery) => {
        if (searchQuery.trim()) {
          dispatch(searchUsers(searchQuery));
        } else {
          dispatch(clearSearchResults());
        }
      }, 300),
    [dispatch]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle user selection
  const handleUserSelect = useCallback(
    async (user) => {
      try {
        await dispatch(getOrCreateChat(user._id));
        if (onUserSelect) {
          onUserSelect(user);
        }
        setQuery('');
        dispatch(clearSearchResults());
      } catch (error) {
        console.error('Error selecting user:', error);
      }
    },
    [dispatch, onUserSelect]
  );

  return (
    <div className="p-4 border-b">
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Search users..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {searchLoading && (
        <div className="mt-2 text-sm text-gray-500">Searching...</div>
      )}
      {query && searchResults.length > 0 && (
        <div className="mt-2 border rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
            >
              <Avatar user={user} size="sm" showOnline={true} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;


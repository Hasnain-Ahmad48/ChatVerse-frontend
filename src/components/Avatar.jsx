import React from 'react';

/**
 * Avatar Component
 * Displays user avatar with fallback to initials
 * 
 * Why React.memo:
 * - Prevents re-renders when parent re-renders but props haven't changed
 * - Useful for frequently rendered components like in chat lists
 * - Improves performance by avoiding unnecessary renders
 */
const Avatar = React.memo(({ user, size = 'md', showOnline = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
          {getInitials(user?.name || 'U')}
        </div>
      )}
      {showOnline && user?.isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;





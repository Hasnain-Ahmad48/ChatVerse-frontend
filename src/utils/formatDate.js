import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format date for message timestamps
 * Shows relative time for recent messages, date for older ones
 */
export const formatMessageDate = (date) => {
  const messageDate = new Date(date);

  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday';
  } else {
    return format(messageDate, 'MMM d');
  }
};

/**
 * Format date for last seen
 */
export const formatLastSeen = (date) => {
  if (!date) return 'Never';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};





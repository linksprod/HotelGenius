export const formatMessageTime = (time: string): string => {
  try {
    // If it's already a time string, return it
    if (time.includes(':')) return time;
    
    // Otherwise try to parse and format
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

export const formatMessageDate = (time: string): string | null => {
  try {
    // Try to parse as date
    const date = new Date(time);
    if (isNaN(date.getTime())) return null;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format based on when the message was sent
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

export const groupMessagesByDate = (messages: any[]): { date: string; messages: any[] }[] => {
  if (!messages || messages.length === 0) return [];
  
  const groupedMessages: { date: string; messages: any[] }[] = [];
  let currentDate = '';
  let currentGroup: any[] = [];
  
  messages.forEach(msg => {
    const messageDate = formatMessageDate(msg.time) || 'Unknown Date';
    
    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groupedMessages.push({
          date: currentDate,
          messages: currentGroup
        });
        currentGroup = [];
      }
      currentDate = messageDate;
    }
    
    currentGroup.push(msg);
  });
  
  // Push the last group
  if (currentGroup.length > 0) {
    groupedMessages.push({
      date: currentDate,
      messages: currentGroup
    });
  }
  
  return groupedMessages;
};

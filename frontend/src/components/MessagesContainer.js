import React from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import { formatDate, isSameDay } from '../utils/helpers';

const MessagesContainer = ({ messages, loading, error, messagesEndRef }) => {
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1];
    
    if (!prevMessage || !isSameDay(message.timestamp, prevMessage.timestamp)) {
      groups.push({
        date: formatDate(message.timestamp),
        messages: [message]
      });
    } else {
      groups[groups.length - 1].messages.push(message);
    }
    
    return groups;
  }, []);

  if (error) {
    return (
      <div className="messages-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {loading && !messages.length ? (
        <div className="loading-container">
          <LoadingSpinner />
          <span>Loading messages...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="empty-conversations">
          <p>No messages yet</p>
          <small>Send a message to start the conversation</small>
        </div>
      ) : (
        groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="date-separator">
              <span>{group.date}</span>
            </div>
            {group.messages.map((message) => (
              <MessageBubble
                key={message._id || message.id}
                message={message}
              />
            ))}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesContainer;
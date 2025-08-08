import React from 'react';
import { getInitials, formatTime } from '../utils/helpers';

const ConversationItem = ({ conversation, isSelected, onClick }) => {
  const displayName = conversation.profile_name || conversation._id;
  const lastMessage = conversation.lastMessage?.text?.body || 'No messages yet';
  const timestamp = conversation.lastMessage?.timestamp;
  
  return (
    <div 
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        <span>{getInitials(displayName)}</span>
      </div>
      
      <div className="conversation-info">
        <div className="conversation-header">
          <div className="conversation-name">
            {displayName}
          </div>
          {timestamp && (
            <div className="conversation-time">
              {formatTime(timestamp)}
            </div>
          )}
        </div>
        
        <div className="conversation-preview">
          <span className="last-message">{lastMessage}</span>
          {conversation.unreadCount > 0 && (
            <div className="unread-badge">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
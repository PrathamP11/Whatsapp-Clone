import React from 'react';
import { formatTime } from '../utils/helpers';

const StatusIcon = ({ status }) => {
  const icons = {
    sent: '✓',
    delivered: '✓✓',
    read: '✓✓'
  };
  
  return (
    <span className={`status-icon status-${status}`}>
      {icons[status] || ''}
    </span>
  );
};

const MessageBubble = ({ message }) => {
  const isOutgoing = message.from !== message.wa_id;
  
  return (
    <div className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
        <div className="message-text">
          {message.text?.body || ''}
        </div>
        <div className="message-time">
          {formatTime(message.timestamp)}
          {isOutgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
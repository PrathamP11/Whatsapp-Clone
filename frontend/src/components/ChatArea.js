import React, { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessagesContainer from './MessagesContainer';
import SendMessageInput from './SendMessageInput';

const ChatArea = ({ selectedChat, messages, onSendMessage, loading, error, onBack, isMobile }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-area">
      <ChatHeader 
        selectedChat={selectedChat} 
        onBack={onBack}
        isMobile={isMobile}
      />
      
      <MessagesContainer 
        messages={messages}
        loading={loading}
        error={error}
        messagesEndRef={messagesEndRef}
      />
      
      <SendMessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatArea;
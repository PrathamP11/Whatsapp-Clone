import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import EmptyState from './EmptyState';
import { apiCall, MockSocket } from '../utils/api';
import '../styles/WhatsApp.css';

const WhatsAppClone = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize mock socket connection
  useEffect(() => {
    const mockSocket = new MockSocket();
    setSocket(mockSocket);

    return () => mockSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (selectedChat && message.wa_id === selectedChat._id) {
        setMessages(prev => [...prev, message]);
      }
      // Update conversations list
      fetchConversations();
    };

    const handleStatusUpdate = (statusUpdate) => {
      if (selectedChat) {
        setMessages(prev => 
          prev.map(msg => 
            (msg.id === statusUpdate.id || msg.meta_msg_id === statusUpdate.id)
              ? { ...msg, status: statusUpdate.status }
              : msg
          )
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('status_update', handleStatusUpdate);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('status_update', handleStatusUpdate);
    };
  }, [socket, selectedChat]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const data = await apiCall('/api/messages/conversations');
        setConversations(data);
      } catch (apiError) {
        console.warn('API not available, using mock data');
        // Enhanced mock conversations with more realistic data
        const mockConversations = [
          {
            _id: '1234567890',
            profile_name: 'John Doe',
            lastMessage: { text: { body: 'Hey! How are you doing today? 😊' }, timestamp: Math.floor(Date.now() / 1000) - 300 },
            messageCount: 25,
            unreadCount: 3
          },
          {
            _id: '0987654321',
            profile_name: 'Jane Smith',
            lastMessage: { text: { body: 'Perfect! See you tomorrow at 3 PM' }, timestamp: Math.floor(Date.now() / 1000) - 600 },
            messageCount: 42,
            unreadCount: 0
          },
          {
            _id: '5555555555',
            profile_name: 'Customer Support',
            lastMessage: { text: { body: 'Your order #12345 has been shipped and is on the way!' }, timestamp: Math.floor(Date.now() / 1000) - 3600 },
            messageCount: 8,
            unreadCount: 1
          },
          {
            _id: '7777777777',
            profile_name: 'Alex Johnson',
            lastMessage: { text: { body: 'Thanks for the quick response! Really appreciate it 🙏' }, timestamp: Math.floor(Date.now() / 1000) - 7200 },
            messageCount: 18,
            unreadCount: 0
          },
          {
            _id: '9999999999',
            profile_name: 'Mom',
            lastMessage: { text: { body: 'Don\'t forget to call grandma today ❤️' }, timestamp: Math.floor(Date.now() / 1000) - 10800 },
            messageCount: 156,
            unreadCount: 2
          },
          {
            _id: '1111111111',
            profile_name: 'Work Team',
            lastMessage: { text: { body: 'Meeting rescheduled to 2 PM tomorrow' }, timestamp: Math.floor(Date.now() / 1000) - 14400 },
            messageCount: 89,
            unreadCount: 0
          }
        ];
        setConversations(mockConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (wa_id) => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const response = await apiCall(`/api/messages/messages/${wa_id}`);
        setMessages(response.messages || response);
      } catch (apiError) {
        console.warn('API not available, using mock messages');
        // Enhanced mock messages with more variety
        const mockMessages = [
          {
            _id: 'msg1',
            id: 'msg1',
            wa_id: wa_id,
            from: wa_id,
            timestamp: Math.floor(Date.now() / 1000) - 7200,
            type: 'text',
            text: { body: 'Hello! How are you doing today?' },
            status: 'read',
            profile_name: selectedChat?.profile_name || wa_id
          },
          {
            _id: 'msg2',
            id: 'msg2',
            wa_id: wa_id,
            from: 'your_business_number',
            timestamp: Math.floor(Date.now() / 1000) - 6900,
            type: 'text',
            text: { body: 'Hi there! I\'m doing great, thanks for asking! How about you?' },
            status: 'read',
            profile_name: 'You'
          },
          {
            _id: 'msg3',
            id: 'msg3',
            wa_id: wa_id,
            from: wa_id,
            timestamp: Math.floor(Date.now() / 1000) - 6600,
            type: 'text',
            text: { body: 'I\'m good too! I wanted to ask about the project we discussed last week. Any updates?' },
            status: 'delivered',
            profile_name: selectedChat?.profile_name || wa_id
          },
          {
            _id: 'msg4',
            id: 'msg4',
            wa_id: wa_id,
            from: 'your_business_number',
            timestamp: Math.floor(Date.now() / 1000) - 6300,
            type: 'text',
            text: { body: 'Yes! I\'ve made great progress. Let me check the current status and get back to you with a detailed update.' },
            status: 'read',
            profile_name: 'You'
          },
          {
            _id: 'msg5',
            id: 'msg5',
            wa_id: wa_id,
            from: wa_id,
            timestamp: Math.floor(Date.now() / 1000) - 6000,
            type: 'text',
            text: { body: 'That sounds perfect! I really appreciate your help with this.' },
            status: 'read',
            profile_name: selectedChat?.profile_name || wa_id
          },
          {
            _id: 'msg6',
            id: 'msg6',
            wa_id: wa_id,
            from: 'your_business_number',
            timestamp: Math.floor(Date.now() / 1000) - 5700,
            type: 'text',
            text: { body: 'No problem at all! I should have the update ready by tomorrow morning. I\'ll send you all the details then. 👍' },
            status: 'read',
            profile_name: 'You'
          },
          {
            _id: 'msg7',
            id: 'msg7',
            wa_id: wa_id,
            from: wa_id,
            timestamp: Math.floor(Date.now() / 1000) - 300,
            type: 'text',
            text: { body: 'Awesome! Looking forward to it. Thanks again! 😊' },
            status: 'sent',
            profile_name: selectedChat?.profile_name || wa_id
          }
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedChat) return;

    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      id: `temp_${Date.now()}`,
      wa_id: selectedChat._id,
      from: 'your_business_number',
      timestamp: Math.floor(Date.now() / 1000),
      type: 'text',
      text: { body: messageText },
      status: 'sent',
      profile_name: 'You'
    };

    // Add message optimistically to UI
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await apiCall('/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          wa_id: selectedChat._id,
          text: messageText,
          profile_name: selectedChat.profile_name
        })
      });
    } catch (apiError) {
      console.warn('API not available, message sent locally only');
      // Simulate realistic status updates for demo
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id 
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }, 2500);

      // Simulate auto-reply for demo
      if (Math.random() > 0.7) { // 30% chance of auto-reply
        setTimeout(() => {
          const replies = [
            "Got it, thanks!",
            "Sounds good 👍",
            "Perfect!",
            "Thanks for letting me know",
            "Appreciate it!",
            "Will do!"
          ];
          
          const autoReply = {
            _id: `auto_${Date.now()}`,
            id: `auto_${Date.now()}`,
            wa_id: selectedChat._id,
            from: selectedChat._id,
            timestamp: Math.floor(Date.now() / 1000),
            type: 'text',
            text: { body: replies[Math.floor(Math.random() * replies.length)] },
            status: 'received',
            profile_name: selectedChat.profile_name
          };
          
          setMessages(prev => [...prev, autoReply]);
        }, 3000 + Math.random() * 2000);
      }
    }
  };

  // Handle chat selection
  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    fetchMessages(conversation._id);
  };

  // Handle back button on mobile
  const handleBackToConversations = () => {
    if (isMobile) {
      setSelectedChat(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className={`whatsapp-container ${selectedChat && isMobile ? 'chat-open' : ''}`}>
      <Sidebar 
        conversations={conversations}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        loading={loading}
        error={error}
      />
      
      {selectedChat ? (
        <ChatArea 
          selectedChat={selectedChat}
          messages={messages}
          onSendMessage={sendMessage}
          loading={loading}
          error={error}
          onBack={handleBackToConversations}
          isMobile={isMobile}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default WhatsAppClone;
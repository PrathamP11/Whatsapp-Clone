import React, { useState, useRef, useEffect } from 'react';
import { getInitials } from '../utils/helpers';

const ChatHeader = ({ selectedChat, onBack, isMobile }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const displayName = selectedChat?.profile_name || selectedChat?._id || 'Unknown';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = (action) => {
    console.log(`${action} clicked - this is just for demo`);
    setShowDropdown(false);
  };

  return (
    <div className="chat-header">
      {isMobile && (
        <button className="back-button" onClick={onBack} title="Back to chats">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
      )}
      
      <div className="conversation-avatar">
        <span>{getInitials(displayName)}</span>
      </div>
      
      <div className="chat-header-info">
        <div className="chat-header-name">
          {displayName}
        </div>
        <div className="chat-header-status">
          last seen today at 12:30 PM
        </div>
      </div>
      
      <div className="chat-header-actions">
        {/* Video Call */}
        <button className="icon-button" title="Video call">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </button>
        
        {/* Voice Call */}
        <button className="icon-button" title="Voice call">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </button>
        
        {/* Search */}
        <button className="icon-button" title="Search messages">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
        
        {/* More Options */}
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="icon-button" 
            title="More options"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleDropdownClick('Contact info')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Contact info
              </div>
              <div className="dropdown-item" onClick={() => handleDropdownClick('Select messages')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Select messages
              </div>
              <div className="dropdown-item" onClick={() => handleDropdownClick('Mute notifications')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
                Mute notifications
              </div>
              <div className="dropdown-item" onClick={() => handleDropdownClick('Disappearing messages')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Disappearing messages
              </div>
              <div className="dropdown-separator"></div>
              <div className="dropdown-item" onClick={() => handleDropdownClick('Clear chat')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Clear chat
              </div>
              <div className="dropdown-item" onClick={() => handleDropdownClick('Delete chat')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete chat
              </div>
              <div className="dropdown-item danger" onClick={() => handleDropdownClick('Block')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                </svg>
                Block
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;

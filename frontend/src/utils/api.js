// API helper functions using fetch instead of axios
export const apiCall = async (url, options = {}) => {
  // For single deployment: use relative URLs in production, localhost in development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? '' // Same domain, use relative URLs
    : 'http://localhost:3001'; // Local development
    
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Real Socket.IO implementation (you should install socket.io-client)
export class RealTimeSocket {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.connected = false;
    this.connect();
  }

  connect() {
    // Import socket.io-client dynamically or install it
    // For now, keeping your mock implementation but with better structure
    console.log('Connecting to WebSocket...');
    
    // Simulate connection
    setTimeout(() => {
      this.connected = true;
      console.log('WebSocket connected');
      this.emit('connect');
    }, 1000);
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    console.log(`Emitting ${event}:`, data);
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Join a conversation room
  joinConversation(wa_id) {
    console.log(`Joining conversation: ${wa_id}`);
    // In real implementation: this.socket.emit('join_conversation', wa_id);
  }

  // Leave a conversation room
  leaveConversation(wa_id) {
    console.log(`Leaving conversation: ${wa_id}`);
    // In real implementation: this.socket.emit('leave_conversation', wa_id);
  }

  close() {
    this.connected = false;
    this.listeners = {};
    console.log('WebSocket disconnected');
  }

  // Simulate receiving updates from server (for testing)
  simulateNewMessage(message) {
    this.emit('new_message', message);
  }

  simulateStatusUpdate(statusUpdate) {
    this.emit('status_update', statusUpdate);
  }
}

// Keep backward compatibility
export const MockSocket = RealTimeSocket;

// API endpoint helpers
export const messagesAPI = {
  getConversations: () => apiCall('/api/messages/conversations'),
  getMessages: (wa_id) => apiCall(`/api/messages/${wa_id}`),
  sendMessage: (messageData) => apiCall('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify(messageData)
  }),
  markAsRead: (wa_id) => apiCall(`/api/messages/${wa_id}/read`, {
    method: 'PATCH'
  })
};

// Health check
export const healthCheck = () => apiCall('/health');
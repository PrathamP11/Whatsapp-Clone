// API helper functions using fetch instead of axios
export const apiCall = async (url, options = {}) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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
  
  // Mock WebSocket for real-time updates (since socket.io-client is not available)
  export class MockSocket {
    constructor() {
      this.listeners = {};
      this.connected = false;
      
      // Simulate connection
      setTimeout(() => {
        this.connected = true;
        console.log('Mock WebSocket connected');
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
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
      }
    }
  
    close() {
      this.connected = false;
      this.listeners = {};
    }
  
    // Simulate receiving updates from server
    simulateNewMessage(message) {
      this.emit('new_message', message);
    }
  
    simulateStatusUpdate(statusUpdate) {
      this.emit('status_update', statusUpdate);
    }
  }
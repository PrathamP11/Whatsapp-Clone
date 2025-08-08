const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true // Allow same origin in production
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
  }
});

// Import routes
const messageRoutes = require('./routes/messages');
const webhookRoutes = require('./routes/webhooks');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow same origin in production
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add timestamp to logs
const originalLog = console.log;
console.log = function(...args) {
  originalLog.apply(console, ['[' + new Date().toISOString() + ']', ...args]);
};

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log(`📚 Database: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Make io available to routes
app.locals.io = io;

// Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('join_conversation', (wa_id) => {
    socket.join(`conversation_${wa_id}`);
    console.log(`👤 User ${socket.id} joined conversation: ${wa_id}`);
  });
  
  socket.on('leave_conversation', (wa_id) => {
    socket.leave(`conversation_${wa_id}`);
    console.log(`👋 User ${socket.id} left conversation: ${wa_id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.error('🚨 Socket error:', error);
  });
});

// --- Serve React frontend in production FIRST ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// API Routes
app.use('/api/messages', messageRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

if (process.env.NODE_ENV === 'production') {
  // Catch all non-API routes and serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // Root endpoint in dev mode
  app.get('/', (req, res) => {
    res.json({
      message: 'WhatsApp Web Clone Backend API (Development Mode)',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        conversations: '/api/messages/conversations',
        messages: '/api/messages/messages/:wa_id',
        send: '/api/messages/send',
        webhook: '/api/webhook'
      }
    });
  });
}

// Catch all other routes (for API only)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.log('⏰ Forced shutdown');
    process.exit(1);
  }, 10000);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
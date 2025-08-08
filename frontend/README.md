# WhatsApp Web Clone

A full-stack WhatsApp Web clone built with Node.js, React, and MongoDB. This project simulates real-time messaging with webhook payload processing and a responsive UI that closely mimics WhatsApp Web.

![WhatsApp Clone Screenshot](https://via.placeholder.com/800x500/111b21/ffffff?text=WhatsApp+Web+Clone)

## 🚀 Features

- **🎨 Authentic WhatsApp Web UI** - Dark theme with identical styling
- **💬 Real-time messaging** - WebSocket support for live updates
- **📱 Fully responsive** - Works perfectly on mobile and desktop
- **🔄 Message status tracking** - Sent, delivered, and read indicators
- **📂 Webhook processing** - Handles WhatsApp Business API payloads
- **💾 MongoDB integration** - Persistent message storage
- **🚀 Easy deployment** - Ready for Vercel, Render, Heroku
- **🔍 Search functionality** - Find conversations quickly
- **⚡ Optimistic updates** - Instant message sending feedback

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Atlas recommended)
- **Socket.IO** - Real-time communication
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - UI library
- **Native Fetch API** - HTTP requests
- **CSS3** - Styling (no external UI libraries)
- **WebSocket** - Real-time updates

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/atlas)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🚀 Quick Start

### 1. Project Setup

```bash
# Create project directory
mkdir whatsapp-clone
cd whatsapp-clone

# Create backend and frontend directories
mkdir backend frontend
```

### 2. Backend Setup

```bash
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose cors dotenv socket.io multer

# Install development dependencies
npm install --save-dev nodemon
```

Create the following files in the `backend` directory:

#### `.env`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority
PORT=3001
BUSINESS_PHONE_NUMBER=your_business_number
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
AUTO_REPLY=false
NODE_ENV=development
```

> **⚠️ Important:** Replace `username`, `password`, and `cluster-url` with your actual MongoDB Atlas credentials.

#### Create Directory Structure
```bash
mkdir models routes scripts payloads
```

### 3. Download Sample Payloads

1. Download the payload files from: https://drive.google.com/file/d/1pWZ9HaHLza8k080pP_GhvKIl8j2voy-U/view?usp=sharing
2. Extract the ZIP file into `backend/payloads/` directory

### 4. Frontend Setup

```bash
cd ../frontend

# Create React app (method 1 - using create-react-app)
npx create-react-app .

# OR method 2 - manual setup
npm init -y
npm install react react-dom react-scripts @testing-library/jest-dom @testing-library/react @testing-library/user-event web-vitals

# Create directory structure
mkdir src/components src/utils src/styles
```

### 5. Copy Project Files

Copy all the provided code files into their respective directories:

**Backend files:**
- `server.js`
- `models/Message.js`
- `routes/messages.js`
- `routes/webhooks.js`
- `scripts/processPayloads.js`

**Frontend files:**
- `public/index.html`
- `src/index.js`
- `src/index.css`
- `src/App.js`
- `src/App.css`
- `src/components/WhatsAppClone.js`
- `src/components/Sidebar.js`
- `src/components/ConversationItem.js`
- `src/components/ChatArea.js`
- `src/components/ChatHeader.js`
- `src/components/MessagesContainer.js`
- `src/components/MessageBubble.js`
- `src/components/SendMessageInput.js`
- `src/components/EmptyState.js`
- `src/components/LoadingSpinner.js`
- `src/utils/api.js`
- `src/utils/helpers.js`
- `src/styles/WhatsApp.css`

## 🗄️ MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose free tier)

### 2. Configure Database Access
1. Go to "Database Access" in the sidebar
2. Click "Add New Database User"
3. Create a username and password
4. Set privileges to "Read and write to any database"

### 3. Configure Network Access
1. Go to "Network Access" in the sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for development)
4. Confirm

### 4. Get Connection String
1. Go to "Clusters" and click "Connect"
2. Select "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Add this to your `.env` file

## ▶️ Running the Application

### 1. Process Sample Payloads (Backend)

```bash
cd backend
npm run process-payloads
```

You should see output like:
```
✅ Connected to MongoDB
📚 Database: whatsapp
Processing payload_1.json...
  - Saved message: msg123
Processing payload_2.json...
  - Updated status for message msg123: delivered

Summary:
- Total messages: 25
- Total conversations: 8
```

### 2. Start Backend Server

```bash
npm run dev
# or
npm start
```

You should see:
```
🚀 Server running on port 3001
✅ Connected to MongoDB
📱 WhatsApp Web Clone Backend API
🔗 Health check: http://localhost:3001/health
```

### 3. Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## 🧪 Testing the Application

### 1. Backend API Testing

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Test conversations endpoint:
```bash
curl http://localhost:3001/api/messages/conversations
```

### 2. Frontend Testing

1. Open `http://localhost:3000`
2. You should see the WhatsApp Web interface
3. Click on a conversation to view messages
4. Send a test message
5. Watch for real-time status updates

## 📚 API Documentation

### Conversations
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/messages/:wa_id` - Get messages for a conversation
- `GET /api/messages/stats/:wa_id` - Get conversation statistics

### Messages
- `POST /api/messages/send` - Send a new message
- `PATCH /api/messages/status/:messageId` - Update message status

### Webhooks
- `GET /api/webhook` - Webhook verification
- `POST /api/webhook` - Process webhook payloads

### Example API Calls

**Send a message:**
```bash
curl -X POST http://localhost:3001/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "wa_id": "1234567890",
    "text": "Hello from API!",
    "profile_name": "Test User"
  }'
```

## 🚀 Deployment

### Option 1: Vercel (Recommended for Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel --prod
```

3. For backend, use Render or Railway (Vercel doesn't support Socket.IO well)

### Option 2: Render (Full-Stack)

1. Push code to GitHub
2. Connect your GitHub repo to Render
3. Create new Web Service
4. Set environment variables
5. Deploy!

### Option 3: Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Deploy:
```bash
railway login
railway init
railway up
```

### Environment Variables for Production

**Backend (.env):**
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
PORT=3001
WEBHOOK_VERIFY_TOKEN=your_secure_token
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
❌ MongoDB connection error: MongoNetworkError
```
- Check your connection string
- Verify network access settings
- Ensure IP is whitelisted

**2. CORS Errors**
```
Access to fetch blocked by CORS policy
```
- Update CORS settings in `server.js`
- Add your frontend domain to allowed origins

**3. Port Already in Use**
```
Error: listen EADDRINUSE :::3001
```
- Kill the process: `lsof -ti:3001 | xargs kill -9`
- Or use different port in `.env`

**4. PayBoardload Processing Fails**
```
Error: ENOENT: no such file or directory
```
- Ensure payloads are extracted to `backend/payloads/`
- Check file permissions

### Debug Commands

```bash
# Check if backend is running
curl http://localhost:3001/health

# View backend logs
cd backend && npm run dev

# Check MongoDB connection
# Login to MongoDB Atlas dashboard

# Clear React cache
cd frontend && rm -rf node_modules package-lock.json && npm install
```

## 📁 Project Structure

```
whatsapp-clone/
├── backend/
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   ├── messages.js
│   │   └── webhooks.js
│   ├── scripts/
│   │   └── processPayloads.js
│   ├── payloads/
│   │   ├── payload_1.json
│   │   └── payload_2.json
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── WhatsAppClone.js
│   │   │   ├── Sidebar.js
│   │   │   ├── ChatArea.js
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   └── WhatsApp.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## ✨ Features Demo

### Message Status Flow
1. **Sent** ✓ - Message saved to database
2. **Delivered** ✓✓ - Message delivered to recipient
3. **Read** ✓✓ (blue) - Message read by recipient

### Real-time Updates
- New messages appear instantly
- Status updates in real-time
- Online/offline indicators
- Typing indicators (bonus feature)

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Swipe gestures
- Adaptive layouts

## 🎯 Assignment Completion Checklist

- [x] **MongoDB Cluster Setup** - Atlas configured
- [x] **Webhook Payload Processor** - Processes JSON files
- [x] **WhatsApp Web UI** - Authentic design
- [x] **Real-time Interface** - WebSocket integration
- [x] **Send Message Feature** - Working input
- [x] **Public Deployment** - Ready for hosting
- [x] **Mobile Responsive** - Works on all devices
- [x] **Message Status** - Sent/delivered/read indicators
- [x] **Conversation List** - Grouped by user
- [x] **Error Handling** - Robust error management

## 🚨 Important Notes

1. **No Real WhatsApp Integration** - This is a simulation only
2. **Demo Data** - Uses mock data when API unavailable
3. **Local Storage** - Avoided per Claude.ai requirements
4. **Security** - Add authentication for production use
5. **Rate Limiting** - Implement for production deployment

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Verify all environment variables
3. Ensure all files are in correct locations
4. Check console for error messages
5. Test API endpoints individually

## 🏆 Submission

For your assignment submission, provide:

1. **Public URL** - Your deployed application
2. **GitHub Repository** (optional) - Source code
3. **Demo Video** (optional) - Showcasing features

### Example Submission:
```
🔗 Live Demo: https://your-whatsapp-clone.vercel.app
📱 Features: Real-time messaging, responsive design, webhook processing
🛠️ Tech: React, Node.js, MongoDB, Socket.IO
```

---

**Good luck with your assignment! 🚀**

Remember: This project demonstrates full-stack development skills, real-time communication, and professional UI/UX design. Take time to test thoroughly before submission.
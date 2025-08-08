const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string-here';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Message Schema (same as server.js)
const messageSchema = new mongoose.Schema({
  id: String,
  meta_msg_id: String,
  wa_id: String,
  from: String,
  to: String,
  timestamp: Number,
  type: String,
  text: {
    body: String
  },
  status: {
    type: String,
    default: 'sent'
  },
  profile_name: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema, 'processed_messages');

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing all messages from database...');
    
    const deleteResult = await Message.deleteMany({});
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} messages`);
    console.log('📊 Database is now empty and ready for fresh data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

// Run the clear function
clearDatabase();
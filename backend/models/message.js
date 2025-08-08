const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // WhatsApp message ID
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Meta message ID for status updates
  meta_msg_id: {
    type: String,
    sparse: true
  },
  
  // WhatsApp ID of the user
  wa_id: {
    type: String,
    required: true,
    index: true
  },
  
  // Sender's number
  from: {
    type: String,
    required: true
  },
  
  // Receiver's number
  to: {
    type: String,
    required: true
  },
  
  // Message timestamp (Unix timestamp)
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  
  // Message type (text, image, document, etc.)
  type: {
    type: String,
    required: true,
    default: 'text'
  },
  
  // Text content
  text: {
    body: {
      type: String,
      default: ''
    }
  },
  
  // Message status (sent, delivered, read, failed)
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Profile name of the sender
  profile_name: {
    type: String,
    default: ''
  },
  
  // Additional media information (for future use)
  image: {
    id: String,
    mime_type: String,
    sha256: String,
    caption: String
  },
  
  document: {
    id: String,
    mime_type: String,
    sha256: String,
    filename: String,
    caption: String
  },
  
  // When this record was created in our database
  created_at: {
    type: Date,
    default: Date.now
  },
  
  // When this record was last updated
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
messageSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for better query performance
messageSchema.index({ wa_id: 1, timestamp: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ created_at: -1 });

module.exports = mongoose.model('Message', messageSchema, 'processed_messages');
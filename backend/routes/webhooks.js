const express = require('express');
const Message = require('../models/message'); // Fix casing to match other imports
const router = express.Router();

// Webhook verification (required by WhatsApp)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Verify the token (you should set this in your environment variables)
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your_verify_token_here';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Process incoming webhook data
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));
    
    // Acknowledge receipt immediately
    res.status(200).send('OK');
    
    // Process the webhook payload
    if (payload.entry && payload.entry[0] && payload.entry[0].changes) {
      for (const change of payload.entry[0].changes) {
        await processWebhookChange(change, req.app.locals.io);
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error.message 
    });
  }
});

// Process individual webhook change
async function processWebhookChange(change, io) {
  try {
    if (!change.value) return;
    
    const { value } = change;
    
    // Process incoming messages
    if (value.messages && value.messages.length > 0) {
      await processIncomingMessages(value, io);
    }
    
    // Process status updates
    if (value.statuses && value.statuses.length > 0) {
      await processStatusUpdates(value.statuses, io);
    }
    
    // Process other webhook events (errors, etc.)
    if (value.errors && value.errors.length > 0) {
      console.error('WhatsApp API errors:', value.errors);
    }
  } catch (error) {
    console.error('Error processing webhook change:', error);
  }
}

// Process incoming messages
async function processIncomingMessages(value, io) {
  try {
    const { messages, contacts, metadata } = value;
    
    for (const message of messages) {
      // Check if message already exists
      const existingMessage = await Message.findOne({ id: message.id });
      if (existingMessage) {
        console.log(`Message ${message.id} already exists, skipping`);
        continue;
      }
      
      // Get contact info
      const contact = contacts?.find(c => c.wa_id === message.from);
      const profileName = contact?.profile?.name || message.from;
      
      // Create message object
      const messageData = {
        id: message.id,
        wa_id: message.from,
        from: message.from,
        to: metadata?.phone_number_id || 'business_number',
        timestamp: parseInt(message.timestamp),
        type: message.type,
        status: 'received',
        profile_name: profileName
      };
      
      // Handle different message types
      switch (message.type) {
        case 'text':
          messageData.text = {
            body: message.text?.body || ''
          };
          break;
          
        case 'image':
          messageData.image = {
            id: message.image?.id,
            mime_type: message.image?.mime_type,
            sha256: message.image?.sha256,
            caption: message.image?.caption || ''
          };
          messageData.text = {
            body: message.image?.caption || '[Image]'
          };
          break;
          
        case 'document':
          messageData.document = {
            id: message.document?.id,
            mime_type: message.document?.mime_type,
            sha256: message.document?.sha256,
            filename: message.document?.filename,
            caption: message.document?.caption || ''
          };
          messageData.text = {
            body: message.document?.caption || `[Document: ${message.document?.filename || 'file'}]`
          };
          break;
          
        case 'audio':
          messageData.text = {
            body: '[Voice message]'
          };
          break;
          
        case 'video':
          messageData.text = {
            body: message.video?.caption || '[Video]'
          };
          break;
          
        default:
          messageData.text = {
            body: `[${message.type} message]`
          };
      }
      
      // Save to database
      const newMessage = new Message(messageData);
      await newMessage.save();
      
      console.log(`Saved incoming message: ${message.id} from ${message.from}`);
      
      // Emit to connected clients
      io?.emit('new_message', newMessage);
      
      // Auto-reply logic (optional - for demo purposes)
      if (process.env.AUTO_REPLY === 'true') {
        await sendAutoReply(message.from, profileName, io);
      }
    }
  } catch (error) {
    console.error('Error processing incoming messages:', error);
  }
}

// Process status updates
async function processStatusUpdates(statuses, io) {
  try {
    for (const status of statuses) {
      const updatedMessage = await Message.findOneAndUpdate(
        { $or: [{ id: status.id }, { meta_msg_id: status.id }] },
        { 
          status: status.status,
          updated_at: Date.now()
        },
        { new: true }
      );
      
      if (updatedMessage) {
        console.log(`Updated message ${status.id} status to: ${status.status}`);
        
        // Emit status update to connected clients
        io?.emit('status_update', {
          id: status.id,
          status: status.status,
          wa_id: updatedMessage.wa_id,
          timestamp: status.timestamp
        });
      } else {
        console.log(`Message ${status.id} not found for status update`);
      }
    }
  } catch (error) {
    console.error('Error processing status updates:', error);
  }
}

// Send auto-reply (optional demo feature)
async function sendAutoReply(wa_id, profileName, io) {
  try {
    const autoReplies = [
      "Thank you for your message! We'll get back to you soon.",
      "Hi there! Thanks for reaching out. Someone from our team will assist you shortly.",
      "We've received your message and will respond as soon as possible."
    ];
    
    const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
    
    const autoReplyMessage = new Message({
      id: `auto_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wa_id,
      from: process.env.BUSINESS_PHONE_NUMBER || 'business_number',
      to: wa_id,
      timestamp: Math.floor(Date.now() / 1000),
      type: 'text',
      text: { body: randomReply },
      status: 'sent',
      profile_name: profileName
    });
    
    await autoReplyMessage.save();
    console.log(`Sent auto-reply to ${wa_id}`);
    
    // Emit to connected clients
    io?.emit('new_message', autoReplyMessage);
    
    // Simulate status updates
    setTimeout(async () => {
      autoReplyMessage.status = 'delivered';
      await autoReplyMessage.save();
      io?.emit('status_update', {
        id: autoReplyMessage.id,
        status: 'delivered',
        wa_id: autoReplyMessage.wa_id
      });
    }, 1000);
    
    setTimeout(async () => {
      autoReplyMessage.status = 'read';
      await autoReplyMessage.save();
      io?.emit('status_update', {
        id: autoReplyMessage.id,
        status: 'read',
        wa_id: autoReplyMessage.wa_id
      });
    }, 3000);
    
  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
}

module.exports = router;
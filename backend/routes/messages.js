const express = require('express');
const Message = require('../models/message'); // Fix casing to match actual file name
const router = express.Router();

// Get all conversations (grouped by wa_id)
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: '$wa_id',
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 },
          profile_name: { $first: '$profile_name' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$from', '$wa_id'] }, // Message from business
                  { $ne: ['$status', 'read'] }  // Not read yet
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          profile_name: 1,
          messageCount: 1,
          unreadCount: 1,
          lastMessage: {
            text: '$lastMessage.text',
            timestamp: '$lastMessage.timestamp',
            status: '$lastMessage.status',
            type: '$lastMessage.type'
          }
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations',
      details: error.message 
    });
  }
});

// Get messages for a specific conversation
router.get('/messages/:wa_id', async (req, res) => {
  try {
    const { wa_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ wa_id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    // Reverse to show oldest first
    messages.reverse();
    
    const totalMessages = await Message.countDocuments({ wa_id });
    
    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      details: error.message 
    });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { wa_id, text, profile_name } = req.body;
    
    // Validation
    if (!wa_id || !text) {
      return res.status(400).json({ 
        error: 'wa_id and text are required' 
      });
    }
    
    const newMessage = new Message({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wa_id,
      from: process.env.BUSINESS_PHONE_NUMBER || 'business_number',
      to: wa_id,
      timestamp: Math.floor(Date.now() / 1000),
      type: 'text',
      text: { body: text.trim() },
      status: 'sent',
      profile_name: profile_name || wa_id
    });
    
    await newMessage.save();
    
    // Emit to WebSocket clients (handled in main server file)
    req.app.locals.io?.emit('new_message', newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Update message status
router.patch('/status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!['sent', 'delivered', 'read', 'failed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: sent, delivered, read, or failed' 
      });
    }
    
    const updatedMessage = await Message.findOneAndUpdate(
      { $or: [{ id: messageId }, { meta_msg_id: messageId }] },
      { status, updated_at: Date.now() },
      { new: true }
    );
    
    if (!updatedMessage) {
      return res.status(404).json({ 
        error: 'Message not found' 
      });
    }
    
    // Emit status update to WebSocket clients
    req.app.locals.io?.emit('status_update', {
      id: messageId,
      status,
      wa_id: updatedMessage.wa_id
    });
    
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ 
      error: 'Failed to update message status',
      details: error.message 
    });
  }
});

// Get conversation statistics
router.get('/stats/:wa_id', async (req, res) => {
  try {
    const { wa_id } = req.params;
    
    const stats = await Message.aggregate([
      { $match: { wa_id } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          sentByBusiness: {
            $sum: {
              $cond: [{ $ne: ['$from', '$wa_id'] }, 1, 0]
            }
          },
          sentByUser: {
            $sum: {
              $cond: [{ $eq: ['$from', '$wa_id'] }, 1, 0]
            }
          },
          unreadMessages: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$from', '$wa_id'] },
                  { $ne: ['$status', 'read'] }
                ]},
                1,
                0
              ]
            }
          },
          firstMessage: { $min: '$timestamp' },
          lastMessage: { $max: '$timestamp' }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalMessages: 0,
      sentByBusiness: 0,
      sentByUser: 0,
      unreadMessages: 0,
      firstMessage: null,
      lastMessage: null
    });
  } catch (error) {
    console.error('Error fetching conversation stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation stats',
      details: error.message 
    });
  }
});

module.exports = router;
const fs = require('fs');
const path = require('path');
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

async function processPayloads() {
  try {
    const payloadsDir = path.join(__dirname, '../payloads');
    
    // Check if payloads directory exists
    if (!fs.existsSync(payloadsDir)) {
      console.error('Payloads directory not found. Please extract the downloaded zip file to backend/payloads/');
      console.log('Creating sample data instead...');
      await createSampleData();
      return;
    }

    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No JSON files found in payloads directory. Creating sample data...');
      await createSampleData();
      return;
    }

    console.log(`Found ${files.length} payload files to process...`);

    for (const file of files) {
      console.log(`Processing ${file}...`);
      const filePath = path.join(payloadsDir, file);
      
      try {
        const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`Payload structure:`, JSON.stringify(payload, null, 2));
        
        if (payload.entry && payload.entry[0] && payload.entry[0].changes) {
          const changes = payload.entry[0].changes[0];
          
          // Process messages
          if (changes.value && changes.value.messages) {
            for (const message of changes.value.messages) {
              const existingMessage = await Message.findOne({ id: message.id });
              
              if (!existingMessage) {
                const profileName = changes.value.contacts && changes.value.contacts[0]
                  ? changes.value.contacts[0].profile.name
                  : `Contact ${message.from}`;

                const newMessage = new Message({
                  id: message.id,
                  wa_id: message.from,
                  from: message.from,
                  to: changes.value.metadata?.phone_number_id || 'business_number',
                  timestamp: parseInt(message.timestamp),
                  type: message.type,
                  text: message.text || { body: '' },
                  status: 'delivered',
                  profile_name: profileName
                });

                await newMessage.save();
                console.log(`  - Saved message: ${message.id} from ${message.from}`);
              } else {
                console.log(`  - Message ${message.id} already exists`);
              }
            }
          }

          // Process status updates
          if (changes.value && changes.value.statuses) {
            for (const status of changes.value.statuses) {
              const result = await Message.findOneAndUpdate(
                { $or: [{ id: status.id }, { meta_msg_id: status.id }] },
                { status: status.status },
                { new: true }
              );

              if (result) {
                console.log(`  - Updated status for message ${status.id}: ${status.status}`);
              } else {
                console.log(`  - Message ${status.id} not found for status update`);
              }
            }
          }
        }
      } catch (parseError) {
        console.error(`Error parsing ${file}:`, parseError.message);
        continue;
      }
    }

    console.log('\nPayload processing completed!');
    
    // Show summary
    const totalMessages = await Message.countDocuments();
    const conversations = await Message.distinct('wa_id');
    
    console.log(`\nSummary:`);
    console.log(`- Total messages: ${totalMessages}`);
    console.log(`- Total conversations: ${conversations.length}`);
    
    if (totalMessages === 0) {
      console.log('\nNo messages were processed. Creating sample data...');
      await createSampleData();
    }

    process.exit(0);
  } catch (error) {
    console.error('Error processing payloads:', error);
    process.exit(1);
  }
}

// Create sample data if no payloads exist or processing fails
async function createSampleData() {
  console.log('Creating sample conversations and messages...');
  
  const sampleData = [
    {
      wa_id: '1234567890',
      profile_name: 'Ashutosh Rana',
      messages: [
        {
          id: 'msg_Ashutosh_1',
          from: '1234567890',
          to: 'business_number',
          text: { body: 'Hello! How are you today?' },
          timestamp: Math.floor(Date.now() / 1000) - 7200,
          status: 'read'
        },
        {
          id: 'msg_business_Ashutosh_1',
          from: 'business_number',
          to: '1234567890',
          text: { body: 'Hi Ashutosh! I\'m doing well, thank you for asking. How can I help you today?' },
          timestamp: Math.floor(Date.now() / 1000) - 7000,
          status: 'read'
        },
        {
          id: 'msg_Ashutosh_2',
          from: '1234567890',
          to: 'business_number',
          text: { body: 'I wanted to ask about the project timeline.' },
          timestamp: Math.floor(Date.now() / 1000) - 6800,
          status: 'delivered'
        },
        {
          id: 'msg_business_Ashutosh_2',
          from: 'business_number',
          to: '1234567890',
          text: { body: 'Sure! Let me check the current status and get back to you with an update.' },
          timestamp: Math.floor(Date.now() / 1000) - 6600,
          status: 'read'
        }
      ]
    },
    {
      wa_id: '0987654321',
      profile_name: 'Jane Smith',
      messages: [
        {
          id: 'msg_jane_1',
          from: '0987654321',
          to: 'business_number',
          text: { body: 'Good morning! I hope you\'re having a great day.' },
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          status: 'read'
        },
        {
          id: 'msg_business_jane_1',
          from: 'business_number',
          to: '0987654321',
          text: { body: 'Good morning Jane! Thank you, I hope you are too. What can I do for you?' },
          timestamp: Math.floor(Date.now() / 1000) - 3400,
          status: 'read'
        },
        {
          id: 'msg_jane_2',
          from: '0987654321',
          to: 'business_number',
          text: { body: 'I was wondering if we could schedule our meeting for tomorrow?' },
          timestamp: Math.floor(Date.now() / 1000) - 3200,
          status: 'delivered'
        },
        {
          id: 'msg_jane_3',
          from: '0987654321',
          to: 'business_number',
          text: { body: 'See you tomorrow!' },
          timestamp: Math.floor(Date.now() / 1000) - 600,
          status: 'delivered'
        }
      ]
    },
    {
      wa_id: '5555555555',
      profile_name: 'Customer Support',
      messages: [
        {
          id: 'msg_support_1',
          from: '5555555555',
          to: 'business_number',
          text: { body: 'Hello! I need help with my recent order.' },
          timestamp: Math.floor(Date.now() / 1000) - 10800,
          status: 'read'
        },
        {
          id: 'msg_business_support_1',
          from: 'business_number',
          to: '5555555555',
          text: { body: 'Of course! I\'d be happy to help. Can you provide your order number?' },
          timestamp: Math.floor(Date.now() / 1000) - 10600,
          status: 'read'
        },
        {
          id: 'msg_business_support_2',
          from: 'business_number',
          to: '5555555555',
          text: { body: 'Your order has been shipped and should arrive in 2-3 business days.' },
          timestamp: Math.floor(Date.now() / 1000) - 3800,
          status: 'read'
        }
      ]
    },
    {
      wa_id: '7777777777',
      profile_name: 'Vivek Chauhan',
      messages: [
        {
          id: 'msg_Vivek_1',
          from: '7777777777',
          to: 'business_number',
          text: { body: 'Hi there! I saw your latest announcement.' },
          timestamp: Math.floor(Date.now() / 1000) - 14400,
          status: 'read'
        },
        {
          id: 'msg_business_Vivek_1',
          from: 'business_number',
          to: '7777777777',
          text: { body: 'Hello Vivek! Thank you for reaching out. What did you think about it?' },
          timestamp: Math.floor(Date.now() / 1000) - 14200,
          status: 'read'
        },
        {
          id: 'msg_Vivek_2',
          from: '7777777777',
          to: 'business_number',
          text: { body: 'It looks really promising! Thanks for the quick response!' },
          timestamp: Math.floor(Date.now() / 1000) - 7400,
          status: 'read'
        }
      ]
    },
    {
      wa_id: '9999999999',
      profile_name: 'Sarah Wilson',
      messages: [
        {
          id: 'msg_sarah_1',
          from: '9999999999',
          to: 'business_number',
          text: { body: 'Hello! I\'m interested in your services.' },
          timestamp: Math.floor(Date.now() / 1000) - 18000,
          status: 'read'
        },
        {
          id: 'msg_business_sarah_1',
          from: 'business_number',
          to: '9999999999',
          text: { body: 'Hi Sarah! That\'s wonderful to hear. I\'d be happy to discuss our services with you.' },
          timestamp: Math.floor(Date.now() / 1000) - 17800,
          status: 'read'
        },
        {
          id: 'msg_sarah_2',
          from: '9999999999',
          to: 'business_number',
          text: { body: 'Can we schedule a meeting to discuss this further?' },
          timestamp: Math.floor(Date.now() / 1000) - 10900,
          status: 'delivered'
        }
      ]
    }
  ];

  let totalSaved = 0;
  
  for (const contact of sampleData) {
    for (const msgData of contact.messages) {
      const existingMessage = await Message.findOne({ id: msgData.id });
      
      if (!existingMessage) {
        const newMessage = new Message({
          id: msgData.id,
          wa_id: contact.wa_id,
          from: msgData.from,
          to: msgData.to,
          timestamp: msgData.timestamp,
          type: 'text',
          text: msgData.text,
          status: msgData.status,
          profile_name: msgData.from === contact.wa_id ? contact.profile_name : 'You'
        });

        await newMessage.save();
        totalSaved++;
        console.log(`  - Created message: ${msgData.id}`);
      }
    }
  }

  console.log(`\nSample data creation completed!`);
  console.log(`- Created ${totalSaved} sample messages`);
  console.log(`- Created ${sampleData.length} sample conversations`);

  // Show final summary
  const totalMessages = await Message.countDocuments();
  const conversations = await Message.distinct('wa_id');
  
  console.log(`\nFinal Summary:`);
  console.log(`- Total messages in database: ${totalMessages}`);
  console.log(`- Total conversations: ${conversations.length}`);
  console.log(`- Conversation IDs: ${conversations.join(', ')}`);
}

// Run the processor
processPayloads();
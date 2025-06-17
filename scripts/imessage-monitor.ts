import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
const applescript = require('applescript');

// Configuration
const CHAT_DB_PATH = path.join(os.homedir(), 'Library/Messages/chat.db');
const LAST_MESSAGE_TIMESTAMP_FILE = 'last_message_timestamp.txt';
const AGENT_API_URL = 'http://localhost:3000/api/agent';
const POLL_INTERVAL = 2000; // Poll every 2 seconds
const TRIGGER_PHRASE = '@agent'; // Messages must start with this to trigger the agent

interface Message {
  ROWID: number;
  guid: string;
  text: string;
  handle_id: number;
  date: number;
  is_from_me: number;
  phone_number?: string;
  service: string;
}

interface Handle {
  ROWID: number;
  id: string; // phone number or email
  service: string;
}

class iMessageMonitor {
  private db: sqlite3.Database | null = null;
  private lastMessageTimestamp: number = 0;

  constructor() {
    this.loadLastMessageTimestamp();
  }

  private loadLastMessageTimestamp(): void {
    try {
      if (fs.existsSync(LAST_MESSAGE_TIMESTAMP_FILE)) {
        const timestamp = fs.readFileSync(LAST_MESSAGE_TIMESTAMP_FILE, 'utf8').trim();
        this.lastMessageTimestamp = parseInt(timestamp) || 0;
        console.log(`📱 Starting from last timestamp: ${this.lastMessageTimestamp}`);
      } else {
        // Start from now if no previous timestamp
        this.lastMessageTimestamp = Date.now() * 1000000; // Convert to nanoseconds (Core Data timestamp)
        console.log('📱 No previous timestamp found, starting from now');
      }
    } catch (error) {
      console.error('Error loading last message timestamp:', error);
      this.lastMessageTimestamp = Date.now() * 1000000;
    }
  }

  private saveLastMessageTimestamp(timestamp: number): void {
    try {
      fs.writeFileSync(LAST_MESSAGE_TIMESTAMP_FILE, timestamp.toString());
    } catch (error) {
      console.error('Error saving last message timestamp:', error);
    }
  }

  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if database exists and is readable
      if (!fs.existsSync(CHAT_DB_PATH)) {
        reject(new Error(`iMessage database not found at ${CHAT_DB_PATH}`));
        return;
      }

      this.db = new sqlite3.Database(CHAT_DB_PATH, sqlite3.OPEN_READONLY, (err: Error | null) => {
        if (err) {
          reject(new Error(`Failed to open iMessage database: ${err.message}`));
        } else {
          console.log('📱 Connected to iMessage database');
          resolve();
        }
      });
    });
  }

  private async queryDatabase<T>(query: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.all(query, params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  private async getNewMessages(): Promise<Message[]> {
    const query = `
      SELECT 
        m.ROWID,
        m.guid,
        m.text,
        m.handle_id,
        m.date,
        m.is_from_me,
        m.service,
        h.id as phone_number
      FROM message m
      LEFT JOIN handle h ON m.handle_id = h.ROWID
      WHERE m.date > ? 
        AND m.text IS NOT NULL 
        AND m.text != ''
        AND m.is_from_me = 1
        AND m.text LIKE ?
        AND m.text NOT LIKE ?
      ORDER BY m.date ASC
    `;

    const messages = await this.queryDatabase<Message>(query, [
      this.lastMessageTimestamp,
      `${TRIGGER_PHRASE}%`,
      '🤖%'  // Exclude agent response messages
    ]);

    // Filter out any messages we've already processed to prevent duplicates
    const uniqueMessages = messages.filter(msg => msg.date > this.lastMessageTimestamp);

    if (messages.length > uniqueMessages.length) {
      console.log(`🔍 Filtered out ${messages.length - uniqueMessages.length} duplicate messages`);
    }

    return uniqueMessages;
  }

  private async sendToAgent(message: string): Promise<string> {
    try {
      const cleanMessage = message.replace(TRIGGER_PHRASE, '').trim();
      console.log(`🌐 Sending to agent API: "${cleanMessage}"`);
      
      const response = await fetch(AGENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: cleanMessage
        }),
      });

      console.log(`🌐 Agent API response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Agent API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const agentResponse = data.response || data.error || 'No response from agent';
      console.log(`🤖 Agent responded: "${agentResponse.substring(0, 100)}${agentResponse.length > 100 ? '...' : ''}"`);
      
      return agentResponse;
    } catch (error) {
      console.error('Error sending to agent:', error);
      return `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async sendIMessage(text: string, targetPhoneNumber?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cleanText = text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      console.log(`📤 Preparing to send iMessage: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      // Use the target phone number if provided, otherwise send to yourself
      const sendScript = targetPhoneNumber ? `
        tell application "Messages"
          activate
          delay 0.5
          try
            set targetService to 1st account whose service type is iMessage
            set targetBuddy to participant "${targetPhoneNumber}" of targetService
            send "${cleanText}" to targetBuddy
            delay 0.3
            return "Message sent successfully to ${targetPhoneNumber}"
          on error errMsg
            return "Error: " & errMsg
          end try
        end tell
      ` : `
        tell application "Messages"
          activate
          delay 0.5
          try
            -- Find the chat where you sent the original message (to yourself)
            repeat with aChat in chats
              if (count of participants of aChat) = 1 then
                -- This is a chat with yourself
                send "${cleanText}" to aChat
                delay 0.3
                return "Message sent successfully to yourself"
              end if
            end repeat
            -- Fallback: send to yourself using your own handle
            set myAccounts to accounts whose service type is iMessage
            if (count of myAccounts) > 0 then
              set myAccount to item 1 of myAccounts
              set myHandle to id of myAccount
              set targetBuddy to participant myHandle of myAccount
              send "${cleanText}" to targetBuddy
              delay 0.3
              return "Message sent successfully (fallback)"
            else
              return "Error: No iMessage account found"
            end if
          on error errMsg
            return "Error: " & errMsg
          end try
        end tell
      `;

      console.log('🍎 Executing AppleScript...');
      const startTime = Date.now();
      
      applescript.execString(sendScript, (sendErr: any, result: any) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`🍎 AppleScript completed in ${duration}ms`);
        
        if (sendErr) {
          console.error('❌ AppleScript error:', sendErr);
          reject(sendErr);
        } else if (result && result.includes('Error:')) {
          console.error('❌ iMessage error:', result);
          reject(new Error(result));
        } else {
          console.log('✅ iMessage sent successfully:', result);
          resolve();
        }
      });
    });
  }



  private async processMessage(message: Message): Promise<void> {
    try {
      console.log(`📨 Processing message: "${message.text}" (ID: ${message.ROWID}) from: ${message.phone_number || 'unknown'}`);
      
      // Send to agent
      const response = await this.sendToAgent(message.text);
      console.log(`🤖 Agent response: "${response}"`);
      
      // Send response back via iMessage to the same sender
      // Note: Since you're sending messages to yourself, we don't pass the phone number
      // so it uses the "send to yourself" logic
      await this.sendIMessage(`🤖 ${response}`);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Send error message back
      try {
        await this.sendIMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  }

  private async checkForNewMessages(): Promise<void> {
    try {
      console.log(`🔍 Checking for new messages (last timestamp: ${this.lastMessageTimestamp})...`);
      const newMessages = await this.getNewMessages();
      
      if (newMessages.length > 0) {
        console.log(`📬 Found ${newMessages.length} new message(s)`);
        console.log(`📝 Message details:`);
        newMessages.forEach((msg, i) => {
          console.log(`   ${i + 1}. ID:${msg.ROWID} | "${msg.text}" | Date:${msg.date}`);
        });
        
        // Update timestamp immediately to prevent reprocessing during next poll
        const latestTimestamp = Math.max(...newMessages.map(m => m.date));
        console.log(`⏰ Updating timestamp from ${this.lastMessageTimestamp} to ${latestTimestamp}`);
        this.lastMessageTimestamp = latestTimestamp;
        this.saveLastMessageTimestamp(latestTimestamp);
        
        for (const message of newMessages) {
          console.log(`\n🔄 Starting to process message ID:${message.ROWID}`);
          await this.processMessage(message);
          console.log(`✅ Finished processing message ID:${message.ROWID}`);
          // Small delay between processing messages
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        console.log(`💤 No new messages found`);
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting iMessage Monitor...');
      console.log(`📝 Trigger phrase: "${TRIGGER_PHRASE}"`);
      console.log(`🌐 Agent API: ${AGENT_API_URL}`);
      console.log(`⏱️  Poll interval: ${POLL_INTERVAL}ms`);
      
      await this.openDatabase();
      
      console.log('✅ iMessage Monitor started successfully!');
      console.log('💡 Send yourself a message starting with "@agent" to test from your iPhone');
      
      // Start polling for new messages
      setInterval(() => {
        this.checkForNewMessages();
      }, POLL_INTERVAL);
      
      // Initial check
      await this.checkForNewMessages();
      
    } catch (error) {
      console.error('❌ Failed to start iMessage Monitor:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    if (this.db) {
      this.db.close((err: Error | null) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('📱 Database connection closed');
        }
      });
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down iMessage Monitor...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down iMessage Monitor...');
  process.exit(0);
});

// Start the monitor
const monitor = new iMessageMonitor();
monitor.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 
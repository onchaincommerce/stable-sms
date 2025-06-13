import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
const appleScript = require('applescript');

const CHAT_DB_PATH = path.join(os.homedir(), 'Library/Messages/chat.db');
const AGENT_API_URL = 'http://localhost:3000/api/agent';

async function testFullFlow(): Promise<void> {
  console.log('🔄 Testing Full iMessage → Agent → iMessage Flow');
  console.log('===============================================\n');

  // Step 1: Test agent API
  console.log('📋 Step 1: Testing Agent API connection...');
  const apiWorking = await testAgentAPI();
  if (!apiWorking) {
    console.log('❌ Agent API not working. Make sure Next.js app is running: npm run dev');
    return;
  }

  // Step 2: Test database access
  console.log('\n📋 Step 2: Testing database access...');
  const dbWorking = await testDatabaseAccess();
  if (!dbWorking) {
    console.log('❌ Database access failed. Check permissions.');
    return;
  }

  // Step 3: Simulate receiving a message
  console.log('\n📋 Step 3: Simulating message processing...');
  await simulateMessageProcessing();

  // Step 4: Test sending response
  console.log('\n📋 Step 4: Testing response delivery...');
  await testResponseDelivery();

  console.log('\n🎉 Full Flow Test Complete!');
  console.log('==========================');
  console.log('✅ If all steps passed, your integration is ready!');
  console.log('📱 Try sending "@agent get my wallet details" from your iPhone');
}

async function testAgentAPI(): Promise<boolean> {
  try {
    const response = await fetch(AGENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: 'test connection'
      }),
    });

    if (response.ok) {
      console.log('✅ Agent API is accessible and responding');
      return true;
    } else {
      console.log(`❌ Agent API returned ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Agent API connection failed:', (error as Error).message);
    return false;
  }
}

async function testDatabaseAccess(): Promise<boolean> {
  if (!fs.existsSync(CHAT_DB_PATH)) {
    console.log('❌ iMessage database not found');
    return false;
  }

  return new Promise((resolve) => {
    const db = new sqlite3.Database(CHAT_DB_PATH, sqlite3.OPEN_READONLY);
    
    db.all("SELECT COUNT(*) as count FROM message LIMIT 1", [], (err: Error | null, rows: any[]) => {
      db.close();
      if (err) {
        console.log('❌ Cannot read database:', err.message);
        resolve(false);
      } else {
        console.log('✅ Database access successful');
        resolve(true);
      }
    });
  });
}

async function simulateMessageProcessing(): Promise<void> {
  console.log('   Simulating: "@agent get my wallet details"');
  
  try {
    const response = await fetch(AGENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: 'get my wallet details'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const agentResponse = data.response || 'No response';
      console.log('✅ Agent processed message successfully');
      console.log(`   Response: "${agentResponse.substring(0, 100)}${agentResponse.length > 100 ? '...' : ''}"`);
    } else {
      console.log('❌ Agent failed to process message');
    }
  } catch (error) {
    console.log('❌ Message processing failed:', (error as Error).message);
  }
}

async function testResponseDelivery(): Promise<void> {
  return new Promise((resolve) => {
    const testMessage = `🧪 Full Flow Test - Agent Response Simulation (${new Date().toLocaleTimeString()})`;
    
    const sendScript = `
      tell application "Messages"
        activate
        delay 0.5
        try
          set recentChat to item 1 of chats
          send "${testMessage}" to recentChat
          delay 0.3
          return "Message sent successfully"
        on error errMsg
          return "Error: " & errMsg
        end try
      end tell
    `;

    console.log('   Sending test response to most recent chat...');
    appleScript.execString(sendScript, (err: any, result: any) => {
      if (err) {
        console.log('❌ Response delivery failed:', err.message);
      } else if (result && result.includes('Error:')) {
        console.log('❌ iMessage error:', result);
      } else {
        console.log('✅ Response delivered successfully');
        console.log('   Check your Messages app for the test message');
      }
      resolve();
    });
  });
}

console.log('🚀 Starting Full Flow Test...');
console.log('Make sure:');
console.log('  - Next.js app is running (npm run dev)');
console.log('  - Messages app is open');
console.log('  - You have a recent conversation\n');

testFullFlow().catch(console.error); 
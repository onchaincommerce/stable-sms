import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
const applescript = require('applescript');

const CHAT_DB_PATH = path.join(os.homedir(), 'Library/Messages/chat.db');

async function testDatabaseAccess(): Promise<boolean> {
  console.log('🔍 Testing iMessage database access...');
  
  if (!fs.existsSync(CHAT_DB_PATH)) {
    console.log('❌ iMessage database not found');
    return false;
  }

  try {
    const db = new sqlite3.Database(CHAT_DB_PATH, sqlite3.OPEN_READONLY);
    
    return new Promise((resolve) => {
      db.all("SELECT COUNT(*) as count FROM message LIMIT 1", [], (err: Error | null, rows: any[]) => {
        db.close((closeErr) => {
          // Ignore close errors for this test
        });
        
        if (err) {
          if (err.message.includes('SQLITE_CANTOPEN') || err.message.includes('unable to open database')) {
            console.log('❌ Cannot access database - Need Full Disk Access permission');
            console.log('   📋 To fix: System Preferences > Security & Privacy > Privacy > Full Disk Access');
            console.log('   📋 Add your terminal app and restart terminal');
          } else {
            console.log('❌ Database error:', err.message);
          }
          resolve(false);
        } else {
          console.log('✅ Database access successful');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.log('❌ Database connection failed:', (error as Error).message);
    if ((error as Error).message.includes('SQLITE_CANTOPEN')) {
      console.log('   💡 This is expected - you need to grant Full Disk Access first');
    }
    return false;
  }
}

async function testAppleScript(): Promise<boolean> {
  console.log('🍎 Testing AppleScript access...');
  
  return new Promise((resolve) => {
    applescript.execString('tell application "Messages" to get name', (err: any, result: any) => {
      if (err) {
        console.log('❌ AppleScript access failed:', err.message);
        resolve(false);
      } else {
        console.log('✅ AppleScript access successful');
        resolve(true);
      }
    });
  });
}

async function testAgentAPI(): Promise<boolean> {
  console.log('🌐 Testing Agent API connection...');
  
  try {
    const response = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: 'test connection'
      }),
    });

    if (response.ok) {
      console.log('✅ Agent API is accessible');
      return true;
    } else {
      console.log(`❌ Agent API returned ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Agent API connection failed:', (error as Error).message);
    console.log('💡 Make sure your Next.js app is running with: npm run dev');
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing iMessage Integration Components\n');
  
  const dbAccess = await testDatabaseAccess();
  const appleScriptAccess = await testAppleScript();
  const apiAccess = await testAgentAPI();
  
  console.log('\n📊 Test Results:');
  console.log(`   Database Access: ${dbAccess ? '✅' : '❌'}`);
  console.log(`   AppleScript Access: ${appleScriptAccess ? '✅' : '❌'}`);
  console.log(`   Agent API Access: ${apiAccess ? '✅' : '❌'}`);
  
  if (dbAccess && appleScriptAccess && apiAccess) {
    console.log('\n🎉 All tests passed! Ready to run the iMessage monitor.');
    console.log('   Start with: npm run imessage-monitor');
  } else {
    console.log('\n⚠️  Some tests failed. Check the setup instructions:');
    if (!dbAccess) {
      console.log('   - Grant Full Disk Access to your terminal');
    }
    if (!appleScriptAccess) {
      console.log('   - Allow terminal access to Messages app');
    }
    if (!apiAccess) {
      console.log('   - Start your Next.js app: npm run dev');
    }
  }
}

runTests().catch(console.error); 
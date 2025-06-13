const applescript = require('applescript');

async function testSendIMessage(): Promise<void> {
  console.log('🧪 Testing iMessage send functionality...');
  
  // Test 1: Get account info
  console.log('📋 Step 1: Getting iMessage account info...');
  
  const getAccountScript = `
    tell application "Messages"
      set myAccounts to accounts whose service type is iMessage
      if (count of myAccounts) > 0 then
        set myAccount to item 1 of myAccounts
        return "Account: " & (name of myAccount) & " ID: " & (id of myAccount)
      else
        return "No iMessage accounts found"
      end if
    end tell
  `;

  return new Promise((resolve) => {
    applescript.execString(getAccountScript, (err: any, result: any) => {
      if (err) {
        console.log('❌ Error getting account:', err.message);
      } else {
        console.log('✅ Account info:', result);
      }

      // Test 2: List recent chats
      console.log('\n📋 Step 2: Checking recent chats...');
      
      const getChatsScript = `
        tell application "Messages"
          set chatList to {}
          repeat with aChat in (first 5 chats)
            set end of chatList to name of aChat
          end repeat
          return chatList as string
        end tell
      `;

      applescript.execString(getChatsScript, (err2: any, result2: any) => {
        if (err2) {
          console.log('❌ Error getting chats:', err2.message);
        } else {
          console.log('✅ Recent chats:', result2);
        }

        // Test 3: Try to send a test message
        console.log('\n📋 Step 3: Attempting to send test message...');
        
        const sendTestScript = `
          tell application "Messages"
            try
              set testMessage to "🤖 Test message from AgentKit integration - " & (current date as string)
              set recentChat to item 1 of chats
              send testMessage to recentChat
              return "Message sent successfully"
            on error errMsg
              return "Error: " & errMsg
            end try
          end tell
        `;

        applescript.execString(sendTestScript, (err3: any, result3: any) => {
          if (err3) {
            console.log('❌ Error sending test message:', err3.message);
          } else {
            console.log('✅ Send result:', result3);
          }

          console.log('\n📊 Test Summary:');
          console.log('   - If account info worked: ✅ Messages access is granted');
          console.log('   - If chats listed: ✅ Can read conversation history');
          console.log('   - If test message sent: ✅ Can send messages');
          console.log('\n💡 If any step failed, try:');
          console.log('   1. Make sure Messages app is open');
          console.log('   2. Grant terminal access to Messages when prompted');
          console.log('   3. Make sure you have recent conversations');
          
          resolve();
        });
      });
    });
  });
}

testSendIMessage().catch(console.error); 
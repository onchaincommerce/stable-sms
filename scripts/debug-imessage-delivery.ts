const appleScript = require('applescript');

async function testDeliveryMethods(): Promise<void> {
  console.log('🔍 Testing different iMessage delivery methods...\n');

  // Method 1: Current approach (probably creating local messages)
  console.log('📋 Method 1: Current approach...');
  await testMethod1();
  
  await delay(2000);
  
  // Method 2: Activate Messages app first
  console.log('\n📋 Method 2: Activate Messages app first...');
  await testMethod2();
  
  await delay(2000);
  
  // Method 3: Use specific buddy/service approach
  console.log('\n📋 Method 3: Target specific service...');
  await testMethod3();
  
  await delay(2000);
  
  // Method 4: Force send with delay
  console.log('\n📋 Method 4: Force send with delay...');
  await testMethod4();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMethod1(): Promise<void> {
  return new Promise((resolve) => {
    const script = `
      tell application "Messages"
        try
          set recentChat to item 1 of chats
          send "🧪 Test Method 1: Current approach - " & (current date as string) to recentChat
          return "Method 1 executed"
        on error errMsg
          return "Method 1 error: " & errMsg
        end try
      end tell
    `;

    appleScript.execString(script, (err: any, result: any) => {
      if (err) {
        console.log('❌ Method 1 failed:', err.message);
      } else {
        console.log('✅ Method 1 result:', result);
      }
      resolve();
    });
  });
}

async function testMethod2(): Promise<void> {
  return new Promise((resolve) => {
    const script = `
      tell application "Messages"
        activate
        delay 0.5
        try
          set recentChat to item 1 of chats
          send "🧪 Test Method 2: With activation - " & (current date as string) to recentChat
          return "Method 2 executed"
        on error errMsg
          return "Method 2 error: " & errMsg
        end try
      end tell
    `;

    appleScript.execString(script, (err: any, result: any) => {
      if (err) {
        console.log('❌ Method 2 failed:', err.message);
      } else {
        console.log('✅ Method 2 result:', result);
      }
      resolve();
    });
  });
}

async function testMethod3(): Promise<void> {
  return new Promise((resolve) => {
    // First get account info
    const getAccountScript = `
      tell application "Messages"
        set myAccounts to accounts whose service type is iMessage
        if (count of myAccounts) > 0 then
          set myAccount to item 1 of myAccounts
          return id of myAccount
        else
          return ""
        end if
      end tell
    `;

    appleScript.execString(getAccountScript, (err: any, myHandle: any) => {
      if (err || !myHandle) {
        console.log('❌ Method 3 failed to get handle:', err?.message || 'No handle');
        resolve();
        return;
      }

      const sendScript = `
        tell application "Messages"
          try
            set targetService to 1st account whose service type is iMessage
            set targetBuddy to participant "${myHandle}" of targetService
            send "🧪 Test Method 3: Specific buddy - " & (current date as string) to targetBuddy
            return "Method 3 executed"
          on error errMsg
            return "Method 3 error: " & errMsg
          end try
        end tell
      `;

      appleScript.execString(sendScript, (sendErr: any, result: any) => {
        if (sendErr) {
          console.log('❌ Method 3 failed:', sendErr.message);
        } else {
          console.log('✅ Method 3 result:', result);
        }
        resolve();
      });
    });
  });
}

async function testMethod4(): Promise<void> {
  return new Promise((resolve) => {
    const script = `
      tell application "Messages"
        activate
        delay 1
        try
          set recentChat to item 1 of chats
          set messageText to "🧪 Test Method 4: Force send with delay - " & (current date as string)
          send messageText to recentChat
          delay 0.5
          return "Method 4 executed"
        on error errMsg
          return "Method 4 error: " & errMsg
        end try
      end tell
    `;

    appleScript.execString(script, (err: any, result: any) => {
      if (err) {
        console.log('❌ Method 4 failed:', err.message);
      } else {
        console.log('✅ Method 4 result:', result);
      }
      resolve();
    });
  });
}

console.log('🧪 iMessage Delivery Debug Tool');
console.log('==============================');
console.log('This will test 4 different methods to send iMessages.');
console.log('Check your Messages app to see which ones actually deliver.\n');

console.log('💡 Make sure:');
console.log('   - Messages app is open');
console.log('   - You have a recent conversation with yourself');
console.log('   - You have an active internet connection\n');

testDeliveryMethods().then(() => {
  console.log('\n📊 Debug Summary:');
  console.log('   Check your Messages app to see which test messages delivered successfully.');
  console.log('   The method that delivers will be used to fix the main integration.');
  console.log('\n💡 If none deliver, the issue might be:');
  console.log('   - iMessage service connectivity');
  console.log('   - Account authentication'); 
  console.log('   - Network/firewall restrictions');
}).catch(console.error); 
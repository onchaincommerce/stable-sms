# iMessage AgentKit Integration

This integration allows you to interact with your AgentKit agent directly through iMessage on macOS. Send yourself messages starting with `@agent` and get responses from your blockchain agent.

## 🏗️ Architecture

The integration consists of:
- **iMessage Monitor**: Polls the macOS Messages database for new messages
- **AgentKit API**: Your existing Next.js API that handles agent interactions
- **AppleScript Bridge**: Sends responses back through iMessage

## 📋 Prerequisites

- macOS (required for iMessage access)
- Messages app configured with iMessage
- Node.js and npm
- Your existing AgentKit setup with `.env` configured

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Grant Permissions

#### Full Disk Access (Required)
Your terminal needs access to read the Messages database:

1. Open **System Preferences** > **Security & Privacy** > **Privacy**
2. Select **Full Disk Access** from the left sidebar
3. Click the lock to make changes
4. Click **+** and add your terminal app:
   - **Terminal**: `/Applications/Utilities/Terminal.app`
   - **iTerm2**: `/Applications/iTerm.app`
   - **VS Code Terminal**: `/Applications/Visual Studio Code.app`

#### Messages Access (Required)
You'll be prompted for Messages access when first running the script. Make sure to allow it.

### 3. Run Setup Script

```bash
chmod +x scripts/setup-imessage.sh
./scripts/setup-imessage.sh
```

This script will:
- Install dependencies
- Check database permissions
- Verify AppleScript access
- Provide setup guidance

## 🎯 Usage

### 1. Start Your Next.js App

```bash
npm run dev
```

### 2. Start the iMessage Monitor

In a separate terminal:

```bash
npm run imessage-monitor
```

You should see:
```
🚀 Starting iMessage Monitor...
📝 Trigger phrase: "@agent"
🌐 Agent API: http://localhost:3000/api/agent
⏱️  Poll interval: 2000ms
📱 Connected to iMessage database
✅ iMessage Monitor started successfully!
💡 Send yourself a message starting with "@agent" to test
```

### 3. Test the Integration

1. Open Messages on your iPhone or Mac
2. Start a conversation with yourself (your own phone number/email)
3. Send a message like: `what is my wallet balance`
4. Wait a few seconds for the agent response

## 📱 Example Usage

```
You: what are my wallet details
🤖: I can see your wallet details:
- Address: 0x1234...5678
- Network: Base Sepolia
- ETH Balance: 0.05 ETH

You: request faucet funds  
🤖: I've requested 0.1 ETH from the Base Sepolia faucet. 
Transaction: 0xabcd...

You: deploy an ERC20 token called TestCoin with symbol TEST
🤖: I've deployed your TestCoin (TEST) token!
Contract Address: 0xdef0...
Transaction: 0x9876...
```

## ⚙️ Configuration

You can modify these settings in `scripts/imessage-monitor.ts`:

```typescript
// Configuration
const CHAT_DB_PATH = path.join(os.homedir(), 'Library/Messages/chat.db');
const LAST_MESSAGE_TIMESTAMP_FILE = 'last_message_timestamp.txt';
const AGENT_API_URL = 'http://localhost:3000/api/agent';
const POLL_INTERVAL = 2000; // Poll every 2 seconds
const TRIGGER_PHRASE = ''; // Process all messages to yourself
```

## 🔧 How It Works

### Message Detection
1. **Database Polling**: Monitors `~/Library/Messages/chat.db` every 2 seconds
2. **Timestamp Tracking**: Only processes messages newer than last processed timestamp
3. **Trigger Filtering**: Only processes messages starting with `@agent` that you sent to yourself

### Message Processing  
1. **Extract Message**: Removes `@agent` prefix from your message
2. **Send to Agent**: POSTs the message to your AgentKit API endpoint
3. **Get Response**: Receives the agent's response
4. **Send Reply**: Uses AppleScript to send response back via iMessage
5. **Update Timestamp**: Saves the timestamp to avoid reprocessing

### Security
- **Local Only**: All data stays on your Mac
- **No Third Parties**: Direct database access, no external services
- **Read-Only Access**: Only reads from Messages database
- **Self-Messaging**: Only processes messages you send to yourself

## 🛠️ Troubleshooting

### "iMessage database not found"
- Ensure Messages app is set up and you've sent/received messages
- Database is created after first use of Messages

### "Cannot read iMessage database"
- Grant Full Disk Access to your terminal (see Setup step 2)
- Restart terminal after granting permissions

### "AppleScript access denied"
- When prompted, allow terminal access to Messages
- Check System Preferences > Security & Privacy > Automation

### "Agent API connection failed"
- Ensure your Next.js app is running (`npm run dev`)
- Verify the API is accessible at `http://localhost:3000/api/agent`
- Check your `.env` file has the required variables

### Messages not being processed
- Verify you're sending messages to yourself
- Look at terminal logs for error messages
- Check `last_message_timestamp.txt` is being updated
- Make sure your messages contain actual text (not just emojis)

### AppleScript not sending messages
- Ensure Messages app is running
- Check you have an active conversation with yourself
- Try manually running: `osascript -e 'tell application "Messages" to get name'`

## 🔒 Privacy & Security

This integration is designed to keep your data private:

- **No External Services**: Everything runs locally on your Mac
- **No Data Storage**: Only stores message timestamps, not content
- **Read-Only Database Access**: Cannot modify your message history
- **Self-Contained**: All code is in your project, no external dependencies for core functionality

## 🚫 Limitations

- **macOS Only**: Requires macOS for iMessage database access
- **Local Network**: Agent must be running locally
- **Self-Messages Only**: Security feature - only processes messages you send to yourself
- **Polling Based**: 2-second delay between checks (adjustable)
- **Terminal Dependent**: Requires keeping terminal open

## 🎛️ Advanced Configuration

### Custom Trigger Phrases
You can add a trigger phrase if desired by modifying `TRIGGER_PHRASE`:

```typescript
const TRIGGER_PHRASE = '@crypto'; // Require "@crypto" prefix
// Don't forget to update the SQL query to include: AND m.text LIKE ?
// And add the parameter: `${TRIGGER_PHRASE}%`
```

### Multiple Users
To allow messages from specific contacts, modify the SQL query in `getNewMessages()`:

```typescript
// Allow messages from specific phone number
AND (m.is_from_me = 1 OR h.id = '+1234567890')
```

### Different Networks
The integration works with any AgentKit network. Just ensure your `.env` is configured correctly.

### Custom Response Format
Modify the `sendIMessage()` call in `processMessage()` to customize response format:

```typescript
await this.sendIMessage(`🤖 AgentKit: ${response}`);
```

## 📝 Development

To extend the integration:

1. **Add New Commands**: Extend your AgentKit with new tools
2. **Custom Processing**: Modify `processMessage()` for custom logic  
3. **Different Triggers**: Support multiple trigger phrases
4. **Rich Responses**: Add emojis, formatting, or structured responses
5. **Logging**: Add file-based logging for debugging

The integration is built to be easily extensible while maintaining privacy and security. 
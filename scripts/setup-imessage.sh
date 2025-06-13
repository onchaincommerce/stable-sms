#!/bin/bash

echo "🚀 Setting up iMessage Integration..."

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script only works on macOS"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔐 Checking permissions for iMessage database..."
CHAT_DB_PATH="$HOME/Library/Messages/chat.db"

if [ ! -f "$CHAT_DB_PATH" ]; then
    echo "❌ iMessage database not found at $CHAT_DB_PATH"
    echo "   Make sure you have Messages app set up and have sent/received messages"
    exit 1
fi

if [ ! -r "$CHAT_DB_PATH" ]; then
    echo "❌ Cannot read iMessage database"
    echo "   You may need to grant Full Disk Access to Terminal/iTerm"
    echo "   Go to: System Preferences > Security & Privacy > Privacy > Full Disk Access"
    echo "   Add Terminal or iTerm2 to the list"
    exit 1
fi

echo "✅ iMessage database is accessible"

echo "🍎 Checking AppleScript permissions..."
osascript -e 'tell application "Messages" to get name' 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  AppleScript access to Messages may need permission"
    echo "   You'll be prompted to allow access when you run the monitor"
fi

echo "✅ Setup complete!"
echo ""
echo "To start the iMessage monitor:"
echo "  1. Start your Next.js app: npm run dev"
echo "  2. In another terminal: npm run imessage-monitor"
echo "  3. Send yourself a message starting with '@agent' to test" 
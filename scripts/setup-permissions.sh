#!/bin/bash

echo "🔐 Setting up macOS Permissions for iMessage Integration"
echo "================================================="
echo ""

# Get the current terminal app
TERMINAL_APP=""
if [[ "$TERM_PROGRAM" == "iTerm.app" ]]; then
    TERMINAL_APP="iTerm2"
    TERMINAL_PATH="/Applications/iTerm.app"
elif [[ "$TERM_PROGRAM" == "Apple_Terminal" ]]; then
    TERMINAL_APP="Terminal"
    TERMINAL_PATH="/Applications/Utilities/Terminal.app"
elif [[ "$TERM_PROGRAM" == "vscode" ]]; then
    TERMINAL_APP="Visual Studio Code"
    TERMINAL_PATH="/Applications/Visual Studio Code.app"
else
    TERMINAL_APP="Your Terminal App"
    TERMINAL_PATH="Unknown"
fi

echo "🖥️  Detected terminal: $TERMINAL_APP"
echo ""

echo "📋 STEP 1: Grant Full Disk Access"
echo "--------------------------------"
echo "1. Open System Preferences (or System Settings on newer macOS)"
echo "2. Go to Security & Privacy → Privacy"
echo "3. Select 'Full Disk Access' from the left sidebar"
echo "4. Click the lock icon and enter your password"
echo "5. Click the '+' button"
echo "6. Navigate to and select: $TERMINAL_PATH"
echo "7. Make sure the checkbox next to $TERMINAL_APP is checked"
echo ""

echo "📋 STEP 2: Grant Messages Access"
echo "-------------------------------"
echo "This will be prompted automatically when you first run the monitor."
echo "When prompted, click 'Allow' to grant access to Messages."
echo ""

echo "📋 STEP 3: Restart Terminal"
echo "--------------------------"
echo "After granting permissions, close and restart your terminal."
echo ""

echo "📋 STEP 4: Test the Setup"
echo "------------------------"
echo "Run: npm run test-imessage"
echo ""

echo "🚨 IMPORTANT NOTES:"
echo "- You MUST restart your terminal after granting permissions"
echo "- If you're using VS Code terminal, restart VS Code entirely"
echo "- Full Disk Access is required to read the Messages database"
echo "- This is a macOS security feature - it's normal to need these permissions"
echo ""

# Check if we can detect the system preferences
echo "🔧 Quick Permission Check"
echo "------------------------"
CHAT_DB_PATH="$HOME/Library/Messages/chat.db"

if [ ! -f "$CHAT_DB_PATH" ]; then
    echo "❌ Messages database not found"
    echo "   Make sure you've used Messages app before"
else
    echo "✅ Messages database exists"
fi

if [ -r "$CHAT_DB_PATH" ]; then
    echo "✅ Database is readable - permissions look good!"
else
    echo "❌ Database is not readable - need to grant Full Disk Access"
fi

echo ""
echo "💡 Need help? Check IMESSAGE_INTEGRATION.md for troubleshooting" 
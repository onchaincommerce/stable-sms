-- Clean Stable SMS Test Script
-- No special characters, just simple text

on run
    set appClipURL to "https://stable-sms.vercel.app"
    set responseMessage to "Your Stable SMS crypto agent is ready! Tap the link below to get started:

" & appClipURL
    
    -- Copy the message to clipboard
    set the clipboard to responseMessage
    
    -- Open Messages app
    tell application "Messages" to activate
    
    -- Show instructions
    display dialog "App Clip message copied to clipboard!

Instructions:
1. Messages app is now open
2. Start a new conversation or open existing chat
3. Paste (Cmd+V) the message
4. Send it!" buttons {"OK"} default button "OK"
    
end run 
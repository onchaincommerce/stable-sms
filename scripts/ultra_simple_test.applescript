-- Ultra Simple Stable SMS Test Script
-- This opens Messages with your App Clip URL ready to send

property appClipURL : "https://stable-sms.vercel.app"
property responseMessage : "🚀 Your Stable SMS crypto agent is ready! Tap the link below to get started:" & return & return & appClipURL

on run
    -- Copy the message to clipboard
    set the clipboard to responseMessage
    
    -- Open Messages app
    tell application "Messages" to activate
    
    -- Show instructions
    display dialog "✅ App Clip message copied to clipboard!" & return & return & "Instructions:" & return & "1. Messages app is now open" & return & "2. Start a new conversation or open existing chat" & return & "3. Paste (Cmd+V) the message" & return & "4. Send it!" buttons {"OK"} default button "OK"
    
end run 
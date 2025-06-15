-- Simple Stable SMS Test Script
-- Run this to send yourself the App Clip URL for testing

property appClipURL : "https://stable-sms.vercel.app"
property responseMessage : "🚀 Your Stable SMS crypto agent is ready! Tap the link below to get started:" & return & return & appClipURL

on run
    -- Ask for phone number or contact name
    set targetContact to text returned of (display dialog "Enter your phone number or contact name to send the App Clip URL:" default answer "+1234567890")
    
    tell application "Messages"
        -- Send the App Clip URL using the correct modern syntax
        send responseMessage to buddy targetContact of service "iMessage"
        
        display dialog "✅ App Clip URL sent to " & targetContact & "!" buttons {"OK"} default button "OK"
    end tell
end run 
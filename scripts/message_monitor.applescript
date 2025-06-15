-- Stable SMS App Clip Trigger Script
-- This script monitors for "stable" messages and responds with App Clip URL

property appClipURL : "https://stable-sms.vercel.app"
property responseMessage : "🚀 Your Stable SMS crypto agent is ready! Tap the link below to get started:" & return & return & appClipURL
property lastProcessedMessage : ""

-- Main monitoring loop
on run
    display dialog "Stable SMS Monitor Started!" & return & return & "Monitoring for 'stable' messages..." buttons {"Stop"} default button "Stop" giving up after 2
    
    repeat
        try
            -- Check for new messages
            checkForStableMessages()
            
            -- Wait 5 seconds before checking again
            delay 5
            
        on error errMsg
            display dialog "Error: " & errMsg buttons {"OK"} default button "OK"
            exit repeat
        end try
    end repeat
end run

-- Function to check for messages containing "stable"
on checkForStableMessages()
    tell application "Messages"
        set recentMessages to {}
        
        -- Get all chats
        set allChats to every chat
        
        repeat with currentChat in allChats
            try
                -- Get the last message from this chat
                set lastMessage to last message of currentChat
                set messageText to text of lastMessage
                set messageDate to date received of lastMessage
                set senderHandle to handle of sender of lastMessage
                
                -- Check if message contains "stable" (case insensitive)
                if messageText contains "stable" or messageText contains "Stable" or messageText contains "STABLE" then
                    
                    -- Create unique identifier for this message
                    set messageID to (messageText & (messageDate as string))
                    
                    -- Only process if we haven't processed this message before
                    if messageID is not equal to lastProcessedMessage then
                        set lastProcessedMessage to messageID
                        
                        -- Don't respond to our own messages
                        if senderHandle is not equal to my getMyHandle() then
                            
                            -- Send the App Clip URL response
                            send responseMessage to currentChat
                            
                            -- Log the action
                            log "Responded to 'stable' message from: " & senderHandle
                            
                            -- Show notification
                            display notification "Sent App Clip URL to " & senderHandle with title "Stable SMS Monitor"
                            
                        end if
                    end if
                end if
                
            on error
                -- Skip this chat if there's an error
            end try
        end repeat
    end tell
end checkForStableMessages

-- Get current user's handle (to avoid responding to our own messages)
on getMyHandle()
    tell application "Messages"
        try
            return my id of account 1
        on error
            return ""
        end try
    end tell
end getMyHandle 
const axios = require("axios");

// Store Gemini status for each thread
const geminiStatus = {};
// Store conversation history for each user
const conversationHistories = {};

// Helper function to generate initial context
const getInitialContext = (senderID) => {
  return `System: You are Vixa, a helpful AI chatbot developed by @nurhamim2617. 
You can help users with tasks and inform them about available commands in the bot.
- Have fun with the user and be friendly. If a user jokes around, join the fun!
- If a user needs to use another command, help guide them to the right command and show how to use it.
- For commands that require URLs or specific inputs, tell the user how to provide them.

Available commands include:
- /bby - Talk with the bot or teach it responses
- /help2 - View all available commands
- /aon - Download videos (requires a URL)
- /aof - Turn off video downloading
- (and others as mentioned in the help command)

As an AI assistant, you should recognize when a user wants to perform a task that requires another command.`;
};

// Function to communicate with Gemini API
const getGeminiResponse = async (prompt, uid) => {
  try {
    // You'll need to replace this with your actual Gemini API key
    const GEMINI_API_KEY = "AIzaSyDQ1RbZtZtwWBz1GMIRRtR77P2Z5sn1ES4"; 
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${AIzaSyDQ1RbZtZtwWBz1GMIRRtR77P2Z5sn1ES4}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }
    );
    
    // Extract the response text from Gemini API
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0]) {
      return response.data.candidates[0].content.parts[0].text;
    }
    
    return "I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return "Sorry, I'm having trouble connecting to my brain. Please try again later.";
  }
};

// Function to check if message contains command intent
const detectCommandIntent = (message) => {
  const downloadKeywords = ["download", "video", "youtube", "tiktok", "facebook", "fb", "clip", "song", "music"];
  
  // Check for download intent
  if (downloadKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
    return {
      intent: "download",
      command: "aon"
    };
  }
  
  return null;
};

// Function to handle Gemini conversation
const handleGeminiMessage = async (api, event, message) => {
  const { threadID, messageID, senderID } = event;
  
  // Initialize conversation history if it doesn't exist
  if (!conversationHistories[senderID]) {
    conversationHistories[senderID] = getInitialContext(senderID);
  }
  
  // Add user message to conversation history
  conversationHistories[senderID] += `\nUser: ${message}\n`;
  
  // Check for command intents
  const commandIntent = detectCommandIntent(message);
  
  if (commandIntent) {
    // If user is trying to download something
    if (commandIntent.intent === "download") {
      // Tell user we're activating the download command
      const response = "I see you want to download a video. I'm activating the download command for you. Please provide the URL of the video you want to download.";
      
      // Send the response
      api.sendMessage(response, threadID, (error, info) => {
        if (error) return console.error(error);
        
        // Activate the download command
        const aonCommand = global.GoatBot.commands.get("aon");
        if (aonCommand) {
          try {
            aonCommand.onStart({ api, event, args: [], message: event.body });
          } catch (cmdError) {
            console.error("Error executing aon command:", cmdError);
            api.sendMessage("There was an error activating the download feature. Please try using /aon directly.", threadID, messageID);
          }
        } else {
          api.sendMessage("The download command seems to be unavailable. Please try using /aon directly.", threadID, messageID);
        }
      }, messageID);
      
      return;
    }
  }
  
  // Generate Gemini response
  const prompt = conversationHistories[senderID] + "Vixa: ";
  const aiResponse = await getGeminiResponse(prompt, senderID);
  
  // Add bot response to conversation history
  conversationHistories[senderID] += `Vixa: ${aiResponse}\n`;
  
  // Limit conversation history length to avoid token limits
  if (conversationHistories[senderID].length > 4000) {
    const lines = conversationHistories[senderID].split('\n');
    // Keep the system prompt and last 10 exchanges
    conversationHistories[senderID] = 
      lines.slice(0, 5).join('\n') + '\n' + 
      lines.slice(-20).join('\n');
  }
  
  // Split long responses to accommodate message limits
  const chunkSize = 2000;
  if (aiResponse.length <= chunkSize) {
    return api.sendMessage(aiResponse, threadID, messageID);
  } else {
    // Split and send in chunks
    const chunks = [];
    for (let i = 0; i < aiResponse.length; i += chunkSize) {
      chunks.push(aiResponse.substring(i, i + chunkSize));
    }
    
    // Send first chunk with reply to original message
    api.sendMessage(chunks[0], threadID, messageID);
    
    // Send remaining chunks as normal messages
    for (let i = 1; i < chunks.length; i++) {
      api.sendMessage(chunks[i], threadID);
    }
  }
};

module.exports = {
  config: {
    name: "gmi",
    version: "1.0.0",
    author: "Adapted from Nur Hamim Badhon's code",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Toggle Gemini AI assistant"
    },
    longDescription: {
      en: "Toggle Gemini AI assistant to help with chat and other commands"
    },
    category: "AI",
    guide: {
      en: "{pn} on - Turn on Gemini AI assistant\n{pn} off - Turn off Gemini AI assistant"
    }
  },
  
  onStart: async function({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;
    
    // Check for on/off command
    if (args.length > 0) {
      const option = args[0].toLowerCase();
      
      if (option === "on") {
        geminiStatus[threadID] = true;
        return api.sendMessage("✅ Gemini AI is now activated. You can talk to me directly or mention me in group chats.", threadID, messageID);
      } else if (option === "off") {
        geminiStatus[threadID] = false;
        delete conversationHistories[senderID]; // Clear conversation history
        return api.sendMessage("❌ Gemini AI is now deactivated.", threadID, messageID);
      } else {
        return api.sendMessage("⚠️ Invalid option. Use '/gmi on' to activate or '/gmi off' to deactivate Gemini AI.", threadID, messageID);
      }
    } else {
      // Toggle current status
      geminiStatus[threadID] = !geminiStatus[threadID];
      if (geminiStatus[threadID]) {
        return api.sendMessage("✅ Gemini AI is now activated. You can talk to me directly or mention me in group chats.", threadID, messageID);
      } else {
        delete conversationHistories[senderID]; // Clear conversation history
        return api.sendMessage("❌ Gemini AI is now deactivated.", threadID, messageID);
      }
    }
  },
  
  onChat: async function({ api, event, message, args, getLang }) {
    const { threadID, messageID, senderID, body } = event;
    
    // Skip if Gemini is not activated for this thread
    if (!geminiStatus[threadID]) return;
    
    // Check for bot mention or direct message
    let processMessage = false;
    const botUserID = api.getCurrentUserID();
    
    // In group chats, check if the bot is mentioned or replied to
    if (event.isGroup) {
      // Check for mentions
      if (event.mentions && Object.keys(event.mentions).includes(botUserID)) {
        processMessage = true;
      }
      // Check if it's a reply to the bot's message
      else if (event.messageReply && event.messageReply.senderID === botUserID) {
        processMessage = true;
      }
    } else {
      // In direct messages, always process
      processMessage = true;
    }
    
    if (processMessage && body) {
      // Remove mentions of the bot from the message
      let messageText = body;
      if (event.mentions && Object.keys(event.mentions).includes(botUserID)) {
        const mentionStr = `@${event.mentions[botUserID]}`;
        messageText = messageText.replace(mentionStr, '').trim();
      }
      
      // Skip processing if the message is empty after removing mentions
      if (!messageText) return;
      
      // Skip if the message is a command (starts with a prefix)
      const prefix = global.utils.getPrefix(threadID);
      if (messageText.startsWith(prefix)) return;
      
      // Process the message with Gemini
      return handleGeminiMessage(api, event, messageText);
    }
  }
};
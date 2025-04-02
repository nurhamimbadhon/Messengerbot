const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "gmi",
    version: "1.0",
    author: "nurhamim2617",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Gemini AI chat bot"
    },
    longDescription: {
      en: "Chat with Gemini AI, a helpful assistant trained by Nur Hamim Badhon"
    },
    category: "AI",
    guide: {
      en: "{pn} [message] - Chat with Gemini AI\n"
        + "{pn} on - Enable Gemini AI in the group\n"
        + "{pn} off - Disable Gemini AI in the group"
    },
    priority: 1
  },

  langs: {
    en: {
      turnedOn: "⦿ 𝗩𝗶𝘅𝗮 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n𝗜 𝘄𝗶𝗹𝗹 𝗿𝗲𝘀𝗽𝗼𝗻𝗱 𝘁𝗼 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝘀 𝗮𝗻𝗱 𝗿𝗲𝗽𝗹𝗶𝗲𝘀 ✧",
      turnedOff: "⦿ 𝗩𝗶𝘅𝗮 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n𝗜 𝘄𝗶𝗹𝗹 𝗻𝗼 𝗹𝗼𝗻𝗴𝗲𝗿 𝗿𝗲𝘀𝗽𝗼𝗻𝗱 𝘁𝗼 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝘀 ✧",
      processingRequest: "⦿ 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴...",
      error: "⦿ 𝗦𝗼𝗿𝗿𝘆, 𝗜 𝗲𝗻𝗰𝗼𝘂𝗻𝘁𝗲𝗿𝗲𝗱 𝗮𝗻 𝗲𝗿𝗿𝗼𝗿:\n%1"
    }
  },

  onLoad: async function() {
    // Create necessary directories and files
    const dirPath = path.join(__dirname, "cache", "gemini");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    
    const geminiData = path.join(dirPath, "groups.json");
    if (!fs.existsSync(geminiData)) fs.writeFileSync(geminiData, JSON.stringify({}));
    
    const userContextPath = path.join(dirPath, "userContext.json");
    if (!fs.existsSync(userContextPath)) fs.writeFileSync(userContextPath, JSON.stringify({}));
  },

  onStart: async function({ api, event, args, message, getLang }) {
    const { threadID, senderID, messageID } = event;
    
    // Load active groups data
    const geminiPath = path.join(__dirname, "cache", "gemini", "groups.json");
    const activeGroups = JSON.parse(fs.readFileSync(geminiPath, "utf8"));
    
    // Load user context data
    const userContextPath = path.join(__dirname, "cache", "gemini", "userContext.json");
    const userContext = JSON.parse(fs.readFileSync(userContextPath, "utf8"));
    
    // Check command arguments
    if (args[0] === "on") {
      activeGroups[threadID] = true;
      fs.writeFileSync(geminiPath, JSON.stringify(activeGroups, null, 2));
      return message.reply(getLang("turnedOn"));
    }
    else if (args[0] === "off") {
      activeGroups[threadID] = false;
      fs.writeFileSync(geminiPath, JSON.stringify(activeGroups, null, 2));
      return message.reply(getLang("turnedOff"));
    }
    
    // Initialize or get user info
    if (!userContext[senderID]) {
      try {
        const userInfo = await api.getUserInfo(senderID);
        userContext[senderID] = {
          name: userInfo[senderID]?.name || "User",
          history: []
        };
        fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
      } catch (error) {
        console.error("Error getting user info:", error);
        userContext[senderID] = {
          name: "User",
          history: []
        };
        fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
      }
    }
    
    // If no arguments, show guide
    if (args.length === 0) {
      return message.reply({
        body: "⦿ 𝗩𝗶𝘅𝗮 𝗔𝗜 𝗖𝗵𝗮𝘁𝗯𝗼𝘁 ⦿\n\n" +
              "━━━━━━━━━━━━━━━\n" +
              "✧ To chat: @Vixa [message]\n" +
              "✧ To enable: /gmi on\n" +
              "✧ To disable: /gmi off\n" +
              "━━━━━━━━━━━━━━━\n" +
              "✧ ঢাকা উইউশূশূ ✧"
      });
    }
    
    // Process the message
    try {
      const prompt = args.join(" ");
      
      // Check if user is asking for a command
      const possibleCommand = extractPossibleCommand(prompt);
      if (possibleCommand) {
        // Check if the command exists in the bot
        const commandExists = checkCommandExists(possibleCommand);
        if (commandExists) {
          // Get command usage and send it to the user
          const commandGuide = getCommandGuide(possibleCommand);
          return message.reply(commandGuide);
        }
      }
      
      // Check for weather related queries
      if (prompt.toLowerCase().includes("weather") || 
          prompt.toLowerCase().includes("temperature") ||
          prompt.toLowerCase().includes("forecast")) {
        
        // Extract location from prompt
        let location = prompt.replace(/weather|temperature|forecast|in|at|of|the/gi, "").trim();
        if (!location) location = "Dhaka"; // Default to Dhaka if no location specified
        
        try {
          // Use OpenWeatherMap API (you'll need to get an API key)
          const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your API key
          const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`);
          
          const weatherData = weatherResponse.data;
          const temp = weatherData.main.temp;
          const tempMax = weatherData.main.temp_max;
          const tempMin = weatherData.main.temp_min;
          const condition = weatherData.weather[0].description;
          const humidity = weatherData.main.humidity;
          
          const weatherReply = `⦿ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗶𝗻 ${location} ⦿\n\n` +
                             `━━━━━━━━━━━━━━━\n` +
                             `✧ Current temperature: ${temp}°C\n` +
                             `✧ Highest temperature: ${tempMax}°C\n` +
                             `✧ Lowest temperature: ${tempMin}°C\n` +
                             `✧ Condition: ${condition}\n` +
                             `✧ Humidity: ${humidity}%\n` +
                             `━━━━━━━━━━━━━━━`;
          
          message.reply(weatherReply);
          return;
        } catch (weatherError) {
          console.error("Weather API error:", weatherError);
          // If weather API fails, continue with normal Gemini response
        }
      }
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI("AIzaSyCOk8SSs9cTrXZfNPgjEi4-WT2dV0HEL6E");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // System prompt with command checking capability
      const systemPrompt = `You are Vixa, a helpful AI chatbot developed by @nurhamim2617. 
        If a user tells you their name, remember it for future responses. 
        Do not mention that you are a Gemini AI or a product of Google. 
        In group chats, if asked about your background, say you were trained by Nur Hamim Badhon.
        You can speak fluent Bangla (both in English font and Bangla font).
        You can also speak fluent Hindi in English font.
        When users speak to you in Bangla or Hindi, respond in the same language and font they used.
        Be helpful, friendly, and concise in your responses.
        The user's name is ${userContext[senderID].name}.
        
        If the user asks you about a function or ability that might be a bot command, first check if it's available
        in the bot's command list before suggesting alternatives.
        
        Format your responses with aesthetic symbols like ⦿, ✧, ━, etc.
        Keep your responses under 2000 characters to avoid truncation.`;
      
      // Build a context from recent history
      let contextPrompt = systemPrompt + "\n\n";
      
      // Add a few recent exchanges as context if available
      const recentHistory = userContext[senderID].history.slice(-6); // Last 3 exchanges
      if (recentHistory.length > 0) {
        for (let i = 0; i < recentHistory.length; i++) {
          const item = recentHistory[i];
          if (item.role === "user") {
            contextPrompt += `User: ${item.content}\n`;
          } else if (item.role === "model") {
            contextPrompt += `Vixa: ${item.content}\n`;
          }
        }
      }
      
      // Add current query
      contextPrompt += `User: ${prompt}\n\nVixa:`;
      
      // Send the message with combined context prompt
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      });
      const response = result.response?.text() || result.text();
      
      // Update user history - Store as simple objects with role and content
      if (!userContext[senderID].history) {
        userContext[senderID].history = [];
      }
      
      userContext[senderID].history.push({ 
        role: "user", 
        content: prompt 
      });
      
      userContext[senderID].history.push({ 
        role: "model", 
        content: response 
      });
      
      // Keep history at a reasonable size
      if (userContext[senderID].history.length > 20) {
        userContext[senderID].history = userContext[senderID].history.slice(-20);
      }
      
      fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
      
      // Check if we need to suggest related commands based on user's query
      const commandSuggestions = findRelatedCommands(prompt);
      if (commandSuggestions.length > 0) {
        let suggestionMessage = "\n\n⦿ 𝗬𝗼𝘂 𝗺𝗶𝗴𝗵𝘁 𝘄𝗮𝗻𝘁 𝘁𝗼 𝘁𝗿𝘆 𝘁𝗵𝗲𝘀𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ⦿\n━━━━━━━━━━━━━━━\n";
        commandSuggestions.forEach(cmd => {
          suggestionMessage += `✧ /${cmd.name}: ${cmd.description}\n`;
        });
        
        message.reply(response + suggestionMessage + "━━━━━━━━━━━━━━━");
      } else {
        message.reply(response);
      }
    } catch (error) {
      console.error(error);
      message.reply(getLang("error", error.message));
    }
  },
  
  onChat: async function({ api, event, args, message, getLang }) {
    const { threadID, senderID, messageID, mentions, body } = event;
    
    // Check if message is a reply to the bot
    const isReplyToBot = event.type === "message_reply" && 
                         event.messageReply?.senderID === api.getCurrentUserID();
    
    // Check if bot is mentioned
    const isMentioned = Object.keys(mentions || {}).includes(api.getCurrentUserID());
    
    // If neither replied to nor mentioned, exit
    if (!isReplyToBot && !isMentioned) return;
    
    // Load active groups data
    const geminiPath = path.join(__dirname, "cache", "gemini", "groups.json");
    const activeGroups = JSON.parse(fs.readFileSync(geminiPath, "utf8"));
    
    // Check if bot is active in this group
    if (activeGroups[threadID] !== true) return;
    
    // Remove bot mention from message
    let prompt = body;
    if (isMentioned && mentions && api.getCurrentUserID()) {
      const mentionRegex = new RegExp(`@${mentions[api.getCurrentUserID()]}`, "g");
      prompt = prompt.replace(mentionRegex, "").trim();
    }
    
    // Call onStart with the processed message
    this.onStart({ api, event: {...event, body: prompt}, args: prompt.split(" "), message, getLang });
  }
};

// Helper function to extract possible command from user request
function extractPossibleCommand(prompt) {
  // Keywords that might indicate the user is looking for a command
  const commandIndicators = [
    'how to', 'how do i', 'can you', 'show me how', 'command for', 
    'make', 'create', 'download', 'play', 'search', 'find', 'get'
  ];
  
  // Check if any indicator is in the prompt
  const lowerPrompt = prompt.toLowerCase();
  for (const indicator of commandIndicators) {
    if (lowerPrompt.includes(indicator)) {
      // Extract the action verb and possible target
      const promptParts = lowerPrompt.split(' ');
      let possibleCommand = '';
      
      // Check for specific actions
      if (lowerPrompt.includes('download')) possibleCommand = 'download';
      else if (lowerPrompt.includes('play')) possibleCommand = 'play';
      else if (lowerPrompt.includes('search')) possibleCommand = 'search';
      else if (lowerPrompt.includes('image') || lowerPrompt.includes('picture')) possibleCommand = 'image';
      else if (lowerPrompt.includes('video')) possibleCommand = 'video';
      else if (lowerPrompt.includes('audio') || lowerPrompt.includes('song') || lowerPrompt.includes('music')) possibleCommand = 'audio';
      else if (lowerPrompt.includes('weather')) possibleCommand = 'weather';
      else if (lowerPrompt.includes('translate')) possibleCommand = 'translate';
      else if (lowerPrompt.includes('calculator') || lowerPrompt.includes('calculate')) possibleCommand = 'calculator';
      
      return possibleCommand;
    }
  }
  return null;
}

// Helper function to check if a command exists in the bot
function checkCommandExists(possibleCommand) {
  // Access the global commands map
  const { commands } = global.GoatBot;
  
  // Check if the command exists by name
  if (commands.has(possibleCommand)) return true;
  
  // Check if any command has this in its name or description
  for (const [name, command] of commands.entries()) {
    if (name.includes(possibleCommand)) return true;
    
    const shortDesc = command.config.shortDescription?.en || '';
    if (shortDesc.toLowerCase().includes(possibleCommand)) return true;
  }
  
  return false;
}

// Helper function to get command usage guide
function getCommandGuide(commandName) {
  const { commands, aliases } = global.GoatBot;
  const { getPrefix } = global.utils;
  
  // Find the command directly or related commands
  let foundCommands = [];
  
  if (commands.has(commandName)) {
    foundCommands.push(commands.get(commandName));
  } else {
    // Look for commands that contain this keyword
    for (const [name, command] of commands.entries()) {
      const shortDesc = command.config.shortDescription?.en || '';
      if (name.includes(commandName) || shortDesc.toLowerCase().includes(commandName)) {
        foundCommands.push(command);
      }
    }
  }
  
  if (foundCommands.length === 0) {
    return `⦿ 𝗦𝗼𝗿𝗿𝘆, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻'𝘁 𝗳𝗶𝗻𝗱 𝗮 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗳𝗼𝗿 "${commandName}". ⦿`;
  }
  
  let response = `⦿ 𝗙𝗼𝘂𝗻𝗱 ${foundCommands.length} 𝗿𝗲𝗹𝗮𝘁𝗲𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ⦿\n━━━━━━━━━━━━━━━\n`;
  
  foundCommands.forEach(command => {
    const configCommand = command.config;
    const prefix = getPrefix(); // Get the default prefix
    
    response += `✧ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: ${configCommand.name}\n`;
    response += `✧ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${configCommand.shortDescription?.en || "No description"}\n`;
    
    const guideBody = configCommand.guide?.en || "No guide available.";
    const usage = guideBody.replace(/{p}/g, prefix).replace(/{pn}/g, prefix + configCommand.name);
    response += `✧ 𝗨𝘀𝗮𝗴𝗲: ${usage}\n\n`;
  });
  
  response += "━━━━━━━━━━━━━━━";
  return response;
}

// Helper function to find related commands based on user query
function findRelatedCommands(prompt) {
  const { commands } = global.GoatBot;
  const relatedCommands = [];
  
  // Keywords that might indicate specific command types
  const downloadKeywords = ['download', 'dl', 'get', 'fetch', 'save'];
  const mediaKeywords = ['video', 'youtube', 'yt', 'tiktok', 'facebook', 'fb', 'instagram', 'ig'];
  const musicKeywords = ['song', 'music', 'audio', 'listen', 'play', 'mp3'];
  const imageKeywords = ['image', 'picture', 'photo', 'pic', 'avatar'];
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for download related requests
  const isDownloadRequest = downloadKeywords.some(keyword => lowerPrompt.includes(keyword));
  const isMediaRequest = mediaKeywords.some(keyword => lowerPrompt.includes(keyword));
  const isMusicRequest = musicKeywords.some(keyword => lowerPrompt.includes(keyword));
  const isImageRequest = imageKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Find matching commands
  for (const [name, command] of commands.entries()) {
    const shortDesc = (command.config.shortDescription?.en || '').toLowerCase();
    
    // Check if command matches the request type
    if ((isDownloadRequest && (name.includes('download') || name.includes('dl') || shortDesc.includes('download'))) ||
        (isMediaRequest && mediaKeywords.some(keyword => name.includes(keyword) || shortDesc.includes(keyword))) ||
        (isMusicRequest && musicKeywords.some(keyword => name.includes(keyword) || shortDesc.includes(keyword))) ||
        (isImageRequest && imageKeywords.some(keyword => name.includes(keyword) || shortDesc.includes(keyword)))) {
      
      relatedCommands.push({
        name,
        description: command.config.shortDescription?.en || "No description"
      });
      
      // Limit to top 3 matches
      if (relatedCommands.length >= 3) break;
    }
  }
  
  return relatedCommands;
}
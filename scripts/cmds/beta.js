const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "Vixa",
    version: "1.0",
    author: "nur",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Vixa AI chat bot"
    },
    longDescription: {
      en: "Chat with Vixa AI, a helpful assistant trained by Nur Hamim Badhon"
    },
    category: "AI",
    guide: {
      en: "{pn} [message] - Chat with Vixa AI\n"
        + "{pn} on - Enable Vixa AI in the group\n"
        + "{pn} off - Disable Vixa AI in the group"
    },
    priority: 1
  },

  langs: {
    en: {
      turnedOn: "⦿ 𝗩𝗶𝘅𝗮 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n𝗜 𝘄𝗶𝗹𝗹 𝗿𝗲𝘀𝗽𝗼𝗻𝗱 𝘁𝗼 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝘀 𝗮𝗻𝗱 𝗿𝗲𝗽𝗹𝗶𝗲𝘀 ✧",
      turnedOff: "⦿ 𝗩𝗶𝘅𝗮 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n𝗜 𝘄𝗶𝗹𝗹 𝗻𝗼 𝗹𝗼𝗻𝗴𝗲𝗿 𝗿𝗲𝘀𝗽𝗼𝗻𝗱 𝘁𝗼 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝘀 ✧",
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
    
    console.log("Vixa AI: Files and directories initialized successfully");
  },

  onStart: async function({ api, event, args, message, getLang }) {
    const { threadID, senderID, messageID, body } = event;
    
    try {
      // Load active groups data
      const geminiPath = path.join(__dirname, "cache", "gemini", "groups.json");
      let activeGroups = {};
      
      // Safely load the active groups data
      try {
        if (fs.existsSync(geminiPath)) {
          const rawData = fs.readFileSync(geminiPath, "utf8");
          if (rawData) {
            activeGroups = JSON.parse(rawData);
          }
        }
      } catch (fileError) {
        console.error("Error reading groups file:", fileError);
        // Create a new file if there's an error
        fs.writeFileSync(geminiPath, JSON.stringify({}));
      }
      
      // Load user context data
      const userContextPath = path.join(__dirname, "cache", "gemini", "userContext.json");
      let userContext = {};
      
      // Safely load the user context data
      try {
        if (fs.existsSync(userContextPath)) {
          const rawData = fs.readFileSync(userContextPath, "utf8");
          if (rawData) {
            userContext = JSON.parse(rawData);
          }
        }
      } catch (fileError) {
        console.error("Error reading user context file:", fileError);
        fs.writeFileSync(userContextPath, JSON.stringify({}));
      }
      
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
            knownUser: false,
            history: []
          };
          fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
        } catch (error) {
          console.error("Error getting user info:", error);
          userContext[senderID] = {
            name: "User",
            knownUser: false,
            history: []
          };
          fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
        }
      }
      
      // If no arguments, show guide
      if (args.length === 0) {
        return message.reply({
          body: "🔹𝗩𝗶𝘅𝗮 𝗔𝗜 \n\n" +
                "━━━━━━━━━━━━━━━\n" +
                "💬 To chat: @Vixa [message]\n" +
                "✅ Enable: /vixa on\n" +
                "❌ Disable: /vixa off\n" +
                "━━━━━━━━━━━━━━━"
        });
      }
      
      // Process the message
      const prompt = args.join(" ");
      
      // Check for specific query types
      const lowerPrompt = prompt.toLowerCase();
      
      // Weather query handling
      if (lowerPrompt.includes("weather") || 
          lowerPrompt.includes("temperature") ||
          lowerPrompt.includes("forecast")) {
        
        // Extract location from prompt
        let location = prompt.replace(/weather|temperature|forecast|in|at|of|the/gi, "").trim();
        if (!location) location = "Dhaka"; // Default to Dhaka if no location specified
        
        try {
          // Note: In a real implementation, you would fetch data from a weather API
          const weatherReply = `⦿ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗶𝗻 ${location} ⦿\n\n` +
                             `━━━━━━━━━━━━━━━\n` +
                             `✧ Current temperature: 28°C\n` +
                             `✧ Condition: Partly Cloudy\n` +
                             `✧ Humidity: 65%\n` +
                             `━━━━━━━━━━━━━━━`;
          
          message.reply(weatherReply);
          return;
        } catch (weatherError) {
          console.error("Weather search error:", weatherError);
          // If weather search fails, continue with normal Gemini response
        }
      }
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI("AIzaSyCOk8SSs9cTrXZfNPgjEi4-WT2dV0HEL6E");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Get thread info for context
      let threadContext = "";
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const isGroup = threadInfo.isGroup;
        const participantCount = threadInfo.participantIDs.length;
        
        if (isGroup) {
          threadContext = `This is a group chat with ${participantCount} members. `;
          if (threadInfo.threadName) {
            threadContext += `The group name is "${threadInfo.threadName}". `;
          }
        } else {
          threadContext = "This is a direct message conversation. ";
        }
      } catch (error) {
        console.error("Error getting thread info:", error);
        threadContext = "This is a conversation. ";
      }
      
      // Detect language from input
      const hasNonLatinChars = /[^\u0000-\u007F]/.test(prompt);
      const hasBangla = /[\u0980-\u09FF]/.test(prompt);
      const hasHindi = /[\u0900-\u097F]/.test(prompt);
      
      let languageContext = "";
      if (hasBangla) {
        languageContext = "The user is writing in Bangla. Reply in Bangla. ";
      } else if (hasHindi) {
        languageContext = "The user is writing in Hindi. Reply in Hindi. ";
      } else if (hasNonLatinChars) {
        languageContext = "The user may be writing in a non-English language. Try to respond in the same language. ";
      }
      
      // Enhanced system prompt
      const systemPrompt = `You are Vixa, a helpful AI chatbot developed by @nurhamim2617. 
        ${threadContext}
        ${languageContext}
        Do not mention that you are a Gemini AI or a product of Google. 
        In group chats, if asked about your background, say you were trained by Nur Hamim Badhon.
        You can speak fluent Bangla (both in English font and Bangla font).
        You can also speak fluent Hindi in English font.
        When users speak to you in Bangla or Hindi, respond in the same language and font they used.
        Understand and respond to slang, informal language, and regional expressions.
        Try to interpret what the user is asking even if their message has typos or grammatical errors.
        Be helpful, friendly, and concise in your responses.
        IMPORTANT: Do NOT prefix your responses with "Vixa:". Just respond directly.
        
        Format your responses with aesthetic symbols like ⦿, ✧, etc.
        Keep your responses under 2000 characters to avoid truncation.
        
        ${userContext[senderID]?.knownUser ? `The user's name is ${userContext[senderID].name}.` : "Try to learn the user's name if they introduce themselves or say hello."}`;

      
      // Build a context from recent history
      let contextPrompt = systemPrompt + "\n\n";
      
      // Add a few recent exchanges as context if available
      if (userContext[senderID]?.history && Array.isArray(userContext[senderID].history)) {
        const recentHistory = userContext[senderID].history.slice(-8); // Last 4 exchanges
        if (recentHistory.length > 0) {
          for (let i = 0; i < recentHistory.length; i++) {
            const item = recentHistory[i];
            if (item && typeof item === 'object') {
              if (item.role === "user") {
                contextPrompt += `User: ${item.content}\n`;
              } else if (item.role === "model") {
                // Don't prefix with "Vixa:"
                contextPrompt += `Response: ${item.content}\n`;
              }
            }
          }
        }
      }
      
      // Add current query
      contextPrompt += `User: ${prompt}\n\nResponse:`;
      
      // Send the message with combined context prompt
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });
      
      let response = "";
      
      // Safely extract the response text
      try {
        if (result && result.response) {
          response = result.response.text();
        } else if (result && typeof result.text === 'function') {
          response = result.text();
        } else if (result && result.text) {
          response = result.text;
        } else {
          response = "⦿ Sorry, I couldn't generate a response at the moment. Please try again.";
        }
      } catch (responseError) {
        console.error("Error extracting response:", responseError);
        response = "⦿ Sorry, I encountered an error processing your request. Please try again.";
      }
      
      // Initialize user history if it doesn't exist
      if (!userContext[senderID]) {
        userContext[senderID] = {
          name: "User",
          knownUser: false,
          history: []
        };
      }
      
      if (!Array.isArray(userContext[senderID].history)) {
        userContext[senderID].history = [];
      }
      
      // Update user history - Store as simple objects with role and content
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
      
      // Extract any name mentioned in the prompt, but only in greeting scenarios
      // First, check if this is likely a greeting or introduction
      const greetingPatterns = [
        /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|namaste|assalamu alaikum|সালাম|হ্যালো|হাই|নমস্কার)/i,
        /^(kmn acho|kemon acho|কেমন আছো|কেমন আছ|কি খবর|ki khobor)/i,
        /^(amar nam|আমার নাম|my name)/i
      ];
      
      const isGreeting = greetingPatterns.some(pattern => pattern.test(prompt.trim()));
      
      // Special phrases that should trigger name learning
      const specialIntroductions = [
        /introduce myself/i,
        /new here/i,
        /first time/i,
        /just joined/i
      ];
      
      const isSpecialIntro = specialIntroductions.some(pattern => pattern.test(prompt));
      
      // Only try to extract name during greetings or introductions
      if (isGreeting || isSpecialIntro || !userContext[senderID].knownUser) {
        const namePatterns = [
          /my name is ([^\.,!?]+)/i,
          /i am ([^\.,!?]+)/i,
          /call me ([^\.,!?]+)/i,
          /([^\.,!?]+) here/i,
          /ami ([^\.,!?]+)/i,
          /amar nam ([^\.,!?]+)/i,
          /আমার নাম ([^\.,!?]+)/i,
          /আমি ([^\.,!?]+)/i
        ];
        
        for (const pattern of namePatterns) {
          const match = prompt.match(pattern);
          if (match && match[1]) {
            const potentialName = match[1].trim();
            // Only use names that are reasonable (not too long, not too short)
            if (potentialName.length > 2 && potentialName.length < 30) {
              userContext[senderID].name = potentialName;
              userContext[senderID].knownUser = true;
              break;
            }
          }
        }
      }
      
      // Save the updated context
      try {
        fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
      } catch (writeError) {
        console.error("Error writing to user context file:", writeError);
      }
      
      // Check if response mentions download commands
      const commandPattern = /\/(download|dl|yt|ytmp3|ytmp4|tiktok|fb|insta|ig)/i;
      if (commandPattern.test(prompt) || lowerPrompt.includes("download") || lowerPrompt.includes("video") || 
          lowerPrompt.includes("song") || lowerPrompt.includes("music") || lowerPrompt.includes("audio")) {
        // Look for command in the global.GoatBot.commands
        try {
          const { commands } = global.GoatBot;
          const downloadCommands = Array.from(commands.entries())
            .filter(([name, cmd]) => 
              cmd.config.name.match(/(download|dl|yt|ytmp3|ytmp4|tiktok|fb|insta|ig)/i) ||
              (cmd.config.shortDescription?.en || "").toLowerCase().includes("download")
            )
            .map(([name, cmd]) => ({
              name,
              description: cmd.config.shortDescription?.en || "No description"
            }));
          
          if (downloadCommands.length > 0) {
            let cmdList = "⦿ 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀:\n━━━━━━━━━━━━━━━\n";
            downloadCommands.forEach(cmd => {
              cmdList += `✧ /${cmd.name}: ${cmd.description}\n`;
            });
            
            message.reply(response + "\n\n" + cmdList + "━━━━━━━━━━━━━━━\n✧ Use these commands to download your media!");
          } else {
            message.reply(response);
          }
        } catch (error) {
          console.error("Error processing commands:", error);
          message.reply(response);
        }
      } else {
        message.reply(response);
      }
    } catch (error) {
      console.error("Error in onStart:", error);
      message.reply(getLang("error", error.message));
    }
  },
  
  onChat: async function({ api, event, message, getLang }) {
    try {
      const { threadID, senderID, mentions, body, type, messageReply } = event;
      
      // Skip processing messages from the bot itself
      const botID = api.getCurrentUserID();
      if (senderID === botID) return;
      
      // Load active groups data
      const geminiPath = path.join(__dirname, "cache", "gemini", "groups.json");
      let activeGroups = {};
      
      try {
        if (fs.existsSync(geminiPath)) {
          const rawData = fs.readFileSync(geminiPath, "utf8");
          if (rawData) {
            activeGroups = JSON.parse(rawData);
          }
        }
      } catch (fileError) {
        console.error("Error reading groups file in onChat:", fileError);
        return;
      }
      
      // Check if bot is active in this group
      if (activeGroups[threadID] !== true) return;
      
      // Check if message is a reply to the bot
      const isReplyToBot = type === "message_reply" && messageReply?.senderID === botID;
      
      // Check if bot is mentioned - more robust detection
      let isMentioned = false;
      let mentionText = "";
      
      // Look for mentions of the bot
      if (mentions && Object.keys(mentions).includes(botID)) {
        isMentioned = true;
        mentionText = mentions[botID];
      }
      
      // Also check for common name mentions that might not be properly tagged
      const botNameRegex = /(^|\s)(@?vixa|@?bot)(\s|$)/i;
      if (botNameRegex.test(body)) {
        isMentioned = true;
      }
      
      // If neither replied to nor mentioned, exit
      if (!isReplyToBot && !isMentioned) return;
      
      console.log(`Vixa AI activated: isReplyToBot=${isReplyToBot}, isMentioned=${isMentioned}`);
      
      // Extract message content
      let prompt = body;
      
      // Remove bot mention from message
      if (isMentioned) {
        // Remove the mention text if available
        if (mentionText) {
          prompt = prompt.replace(new RegExp(`@${mentionText}`, "g"), "").trim();
        }
        
        // Also try to remove common bot name patterns
        prompt = prompt.replace(/@?vixa/gi, "").trim();
        prompt = prompt.replace(/@?bot/gi, "").trim();
      }
      
      // Handle empty prompts after mention removal
      if (!prompt || prompt.trim() === "") {
        prompt = "hello";
      }
      
      // Create args array from prompt
      const args = prompt.split(" ");
      
      // Log the processed message for debugging
      console.log(`Processing Vixa command with prompt: "${prompt}"`);
      
      // Call onStart with the processed message
      await this.onStart({ 
        api, 
        event: {
          ...event, 
          body: `/vixa ${prompt}` // Format as a command
        }, 
        args, 
        message, 
        getLang 
      });
    } catch (error) {  
      console.error("Error in onChat:", error);
    }
  }
};
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");

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
      message.reply(getLang("processingRequest"));
      
      // Initialize Gemini AI with the correct import
      const genAI = new GoogleGenerativeAI("AIzaSyCOk8SSs9cTrXZfNPgjEi4-WT2dV0HEL6E");
      
      // Get the model - Updated to use the correct API method
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // System prompt
      const systemPrompt = `You are Vixa, a helpful AI chatbot developed by @nurhamim2617. 
        If a user tells you their name, remember it for future responses. 
        Do not mention that you are a Gemini AI or a product of Google. 
        In group chats, if asked about your background, say you were trained by Nur Hamim Badhon.
        You can speak fluent Bangla (both in English font and Bangla font). 
        When users speak to you in Bangla, respond in the same font they used.
        Be helpful, friendly, and concise in your responses.
        The user's name is ${userContext[senderID].name}.
        
        If users ask about downloading videos or other commands, check if such commands exist and guide them on how to use them.
        
        Always format your responses with aesthetic symbols like ⦿, ✧, ━, etc.`;
      
      // Create chat history in the format expected by Gemini API
      const history = userContext[senderID].history.slice(-5).map(item => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.parts[0].text }]
      }));
      
      // Start a chat session
      const chat = model.startChat({
        history,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
      });
      
      // Send the message and await response
      const result = await chat.sendMessage([
        { text: systemPrompt + "\n\nUser: " + prompt }
      ]);
      const response = result.response.text();
      
      // Update user history
      userContext[senderID].history.push({ 
        role: "user", 
        parts: [{ text: prompt }] 
      });
      
      userContext[senderID].history.push({ 
        role: "model", 
        parts: [{ text: response }] 
      });
      
      fs.writeFileSync(userContextPath, JSON.stringify(userContext, null, 2));
      
      // Check if response mentions other commands
      const commandPattern = /\/(download|dl|yt|ytmp3|ytmp4|tiktok|fb|insta|ig)/i;
      if (commandPattern.test(prompt) || response.toLowerCase().includes("download")) {
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
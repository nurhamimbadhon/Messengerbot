const axios = require("axios");
const logger = require("./utils/logger"); // Ensure you have a logger module

// Configuration
const API_BASE = "https://vixa-api.onrender.com"; // Direct API URL instead of GitHub
const KEYWORDS = ["vixa", "sona", "alia", "bot", "janu", "hlw"];
const DEFAULT_ERROR_MSG = "An error occurred. Please try again later. 🛠️";

// Improved error handler with logging
const handleError = (api, threadID, messageID, error) => {
  logger.error(`Error in Vixa bot: ${error.message}`, error.stack);
  api.sendMessage(DEFAULT_ERROR_MSG, threadID, messageID);
};

// Enhanced API caller with timeout
const callAPI = async (endpoint, params) => {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      params,
      timeout: 10000 // 10-second timeout
    });
    return response.data;
  } catch (error) {
    logger.error(`API call failed: ${error.config.url}`, error.message);
    throw error;
  }
};

// Modified teaching function with better validation
const teachBot = async (api, event, args) => {
  const { threadID, messageID, senderID } = event;
  const teachText = args.join(" ");

  const [ask, answers] = teachText.split(" - ").map(t => t.trim());
  if (!ask || !answers) {
    return api.sendMessage(
      "📝 Teaching Format:\n/teach question - answer1, answer2,...\nExample: /teach hi - hello, hey, hi there",
      threadID,
      messageID
    );
  }

  try {
    const result = await callAPI("/vixa/teach", {
      ask,
      ans: answers.split(",").map(a => a.trim()),
      uid: senderID
    });

    const successMessage = result.status === "Success" 
      ? `✅ Taught Successfully!\n\nQuestion: ${ask}\nAnswers: ${answers}\n\nTotal Teachings: ${result.totalTeachings || 0}`
      : "❌ Teaching failed. Please try different wording.";
    
    api.sendMessage(successMessage, threadID, messageID);
  } catch (error) {
    handleError(api, threadID, messageID, error);
  }
};

// Enhanced chat function with context awareness
const chatWithBot = async (api, event, input) => {
  const { threadID, messageID, senderID, isGroup } = event;
  
  try {
    const response = await callAPI("/vixa/chat", {
      text: input,
      uid: senderID,
      font: "2",
      context: isGroup ? "group" : "private"
    });

    const reply = response.text || "I'm still learning! Please teach me 😊";
    const fullReply = `${reply}${response.react || "✨"}`;

    api.sendMessage(fullReply, threadID, (err, info) => {
      if (!err && global.GoatBot?.onReply) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "vixa",
          type: "reply",
          author: senderID,
          question: input,
          reply: fullReply
        });
      }
    }, messageID);
  } catch (error) {
    handleError(api, threadID, messageID, error);
  }
};

// Improved message management
const manageMessages = async (api, event, action) => {
  const { threadID, messageID, senderID } = event;
  const args = event.body.split(" ").slice(2);
  
  try {
    const [target, index] = args.join(" ").split(" - ");
    const endpoint = `/vixa/${action}`;
    
    const result = await callAPI(endpoint, {
      text: target,
      uid: senderID,
      ...(index && { index: parseInt(index) })
    });

    const message = result.status === "Success"
      ? `✅ Successfully ${action}ed ${index ? `index ${index} of ` : ""}"${target}"`
      : `❌ ${result.message || "Action failed"}`;
    
    api.sendMessage(message, threadID, messageID);
  } catch (error) {
    handleError(api, threadID, messageID, error);
  }
};

// New feature: Bot information command
const showBotInfo = async (api, event) => {
  const { threadID, messageID } = event;
  try {
    const info = await callAPI("/vixa/info");
    const message = [
      "🤖 Vixa Bot Information",
      `Version: ${this.config.version}`,
      `Memory: ${info.memoryUsage} MB`,
      `Uptime: ${info.uptime}`,
      `Total Conversations: ${info.conversations}`,
      `Active Users: ${info.activeUsers}`
    ].join("\n");
    
    api.sendMessage(message, threadID, messageID);
  } catch (error) {
    handleError(api, threadID, messageID, error);
  }
};

module.exports = {
  config: {
    name: "vixa",
    version: "2.1.0",
    author: "Nazrul",
    role: 0,
    description: "Advanced AI chatbot with learning capabilities",
    category: "AI",
    guide: {
      en: [
        "{pn} <message> - Chat with Vixa",
        "{pn} teach <question> - <answers> - Teach new responses",
        "{pn} info - Show bot statistics",
        "{pn} delete <text> [ - index] - Remove responses",
        "{pn} edit <text> - <new text> - Modify responses"
      ].join("\n")
    }
  },

  onStart: async ({ api, event, args }) => {
    const command = args[0]?.toLowerCase();
    const subCommands = ["teach", "delete", "edit", "info"];

    if (subCommands.includes(command)) {
      switch (command) {
        case "teach": return teachBot(api, event, args.slice(1));
        case "info": return showBotInfo(api, event);
        default: return manageMessages(api, event, command);
      }
    }
    return chatWithBot(api, event, args.join(" "));
  },

  onChat: async ({ api, event }) => {
    const { body, threadID, messageID, senderID, isGroup } = event;
    
    // Check if bot is mentioned in group chats
    const isMentioned = isGroup && event.mentions?.some(
      mention => mention.id === api.getCurrentUserID()
    );

    if (isMentioned || KEYWORDS.some(kw => body.toLowerCase().startsWith(kw))) {
      const input = body.replace(/@[^ ]+/g, "").trim();
      if (input) return chatWithBot(api, { ...event, body: input });
    }
  },

  onReply: async ({ api, event, Reply }) => {
    if (Reply.author === event.senderID && Reply.commandName === "vixa") {
      return chatWithBot(api, {
        ...event,
        body: event.body
      });
    }
  }
};
module.exports = {
  config: {
    name: "leave",
    version: "1.0",
    author: "Nur Hamim",
    role: 0, // 0 for normal user, 1 for admin
    shortDescription: "Make the bot leave the current group",
    longDescription: "Allows admins to force the bot to leave the current group chat",
    category: "admin",
    guide: "{prefix}leave"
  },

  onStart: async function({ api, event, args, config }) {
    // Check if the command is executed in a group chat
    if (event.isGroup) {
      // Verify admin privileges
      const adminIDs = config.facebookAccount.adminBot;
      if (!adminIDs.includes(event.senderID)) {
        return api.sendMessage("⛔ Only admins can use this command.", event.threadID, event.messageID);
      }

      try {
        // Get the bot's user ID
        const botUserID = api.getCurrentUserID();
        
        // Remove the bot from the group
        await api.removeUserFromGroup(botUserID, event.threadID);
        
        // Optional: Send confirmation message before leaving
        api.sendMessage({
          body: "✅ Bot is now leaving this group...",
        }, event.threadID, () => {});
      } 
      catch (error) {
        console.error("Error leaving group:", error);
        api.sendMessage("❌ Failed to leave the group. Please try again later.", event.threadID, event.messageID);
      }
    } 
    else {
      api.sendMessage("⚠️ This command can only be used in group chats.", event.threadID, event.messageID);
    }
  }
};
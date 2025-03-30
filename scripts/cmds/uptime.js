module.exports = {
  config: {
    name: "uptime",
    aliases:["up", "upt"],
    version: "1.7",
    author: "Anas x 114",
    role: 2,
    shortDescription: {
      en: "Get stylish bot stats and uptime!"
    },
    longDescription: {
      en: "Displays bot uptime, user, thread stats, and total messages processed in a modern and visually engaging style."
    },
    category: "system",
    guide: {
      en: "Use {p}uptime to display the bot's stats in style."
    }
  },
  onStart: async function ({ api, event, usersData, threadsData, messageCount }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      // Calculate formatted uptime
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

      // Active threads (threads with activity)
      const activeThreads = allThreads.filter(thread => thread.messageCount > 0).length;

      // Total messages processed
      const totalMessages = messageCount || 0; // Replace with actual message count logic if needed

      // Stylish message design
      const message = `
┏━━━━━━━━━━━━━━━┓
  ♡𝕮𝖍𝖔𝖈𝖔𝖑𝖆𝖙𝖊 𝕼𝖚𝖊𝖊𝖓♡
┗━━━━━━━━━━━━━━━┛
📆 Uptime: ${uptimeString}
🙋 Total Users: ${allUsers.length}
💬 Total Threads: ${allThreads.length}
🔥 Active Threads: ${activeThreads}
📨 Total Messages: ${totalMessages}
━━━━━━━━━━━━━━━━━━━
💡 Keep the vibes going!
      `;

      api.sendMessage(message.trim(), event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving bot stats.", event.threadID);
    }
  }
};

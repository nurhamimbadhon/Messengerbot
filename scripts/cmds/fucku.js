module.exports = {
  config: {
    name: "fuck you",
    version: "1.0",
    author: "Nur Hamim",
    countDown: 0,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "no prefix",
  },
  
  onStart: async function() {
    
  },

  onChat: async function ({ event, message }) {
    if (event.body && /f[\W_]*[u@]([\W_]*[c@])?[\W_]*k[\W_]*[y@]?[o0]?[u@]?/i.test(event.body)) {
      try {
        return await message.reply({
          body: "Fuck you too🖕",
          attachment: await global.utils.getStreamFromURL("https://i.imgur.com/9bNeakd.gif")
        });
      } catch (err) {
        console.error("Error in fuck you module:", err);
        return message.reply("Fuck you too🖕");
      }
    }
  }
};

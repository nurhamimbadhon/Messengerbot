const axios = require("axios");
const fs = require("fs-extra");
module.exports = {
  config: {
    name: "v2a",
    aliases: ["v2a", "audio"],
    description: "Convert Video to audio",
    version: "1.3",
    author: "dipto",
    countDown: 10,
    description: {
      en: "Reply to a video"
    },
    category: "media",
    guide: {
      en: "{p}{n}"
    },
    noPrefix: true
  },
  
  onChat: async function({ api, event, args, message, client }) {
    const nonPrefixCommands = ["v2a", "audio"];
    const prefixCommands = ["/v2a", "/audio"];
    const input = event.body?.trim().toLowerCase();
    if (!input || (!nonPrefixCommands.some(cmd => input === cmd) && !prefixCommands.some(cmd => input === cmd))) {
      return;
    }
    if (nonPrefixCommands.some(cmd => input === cmd)) {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return;
      }
      
      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "video") {
        return;
      }
    }
    this.onStart({ api, event, args, message, isPrefix: prefixCommands.some(cmd => input === cmd) });
  },
  
  onStart: async function ({ api, event, args, message, isPrefix }) {
    try {
      api.setMessageReaction("⌛", event.messageID, (err) => {}, true);
      
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        if (isPrefix) {
          api.setMessageReaction("❌", event.messageID, (err) => {}, true);
          message.reply("Please reply to a video to convert it to audio.");
        }
        return;
      }

      const dipto = event.messageReply.attachments[0];
      if (dipto.type !== "video") {
        if (isPrefix) {
          api.setMessageReaction("❌", event.messageID, (err) => {}, true);
          message.reply("The replied content must be a video.");
        }
        return;
      }
      
      const { data } = await axios.get(dipto.url, { method: 'GET', responseType: 'arraybuffer' });
      const path = __dirname + `/cache/dvia.m4a`;
      
      if(!fs.existsSync(__dirname + '/cache')){
        fs.mkdirSync(__dirname + '/cache', { recursive: true });
      }
      
      fs.writeFileSync(path, Buffer.from(data, 'utf-8'));

      const audioReadStream = fs.createReadStream(path);
      const msg = { body: "", attachment: [audioReadStream] };
      
      api.sendMessage(msg, event.threadID, async () => {
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        try {
          fs.unlinkSync(path);
        } catch (cleanupErr) {
          console.log("Failed to clean up cache file:", cleanupErr);
        }
      }, event.messageID);
      
    } catch (e) {
      console.log(e);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(e.message);
    }
  },
};
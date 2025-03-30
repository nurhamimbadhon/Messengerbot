const fs = require("fs");
const path = require("path");
const axios = require("axios");

const ratios = {
  "1:1": { width: 1024, height: 1024 },
  "9:7": { width: 1152, height: 896 },
  "7:9": { width: 896, height: 1152 },
  "19:13": { width: 1216, height: 832 },
  "13:19": { width: 832, height: 1216 },
  "7:4": { width: 1344, height: 768 },
  "4:7": { width: 768, height: 1344 },
  "12:5": { width: 1536, height: 640 },
  "5:12": { width: 640, height: 1536 }

};

const styles = ['sketch', 'pastel', 'anime', 'enhancer', 'none'];

module.exports = {
  config: {
    name: "xl",
    aliases: ["sdxl"],
    author: "Vex_Kshitiz",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "animagine xl 3.1.",
    longDescription: "Generates an image based on animagine xl 3.1.",
    category: "fun",
    guide: "{p}xl <prompt> [--ar <ratio>] [-- <style>]"
  },
  onStart: async function ({ message, args, api, event }) {
    api.setMessageReaction("🤤", event.messageID, (err) => {}, true);
    try {
      const joinedArgs = args.join(" ");
      let [prompt, ratio, style] = joinedArgs.split(/--ar|--/).map(arg => arg.trim());

      if (!prompt) {
        message.reply("❌ | ওই বোকাচোদা কিছু লিখ নাকি ব্রেইন পুটকী তে ??.");
        return;
      }

      ratio = ratio && ratios.hasOwnProperty(ratio.trim()) ? ratio.trim() : "1:1";
      style = style && styles.includes(style.trim()) ? style.trim() : "none";

      const apiUrl = `https://animagine-xl-ihkp.onrender.com/generate?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}&style=${encodeURIComponent(style)}`;

      const response = await axios.get(apiUrl);

      if (!response.data.outputs || !response.data.outputs[0] || !response.data.outputs[0].value[0] || !response.data.outputs[0].value[0].file) {
        throw new Error("Image data not.");
      }

      const imageData = response.data.outputs[0].value[0].file;
      const imageUrl = imageData.url;

      const imagePath = path.join(__dirname, "/cache", `xl.jpg`);

      const writer = fs.createWriteStream(imagePath);
      const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
      imageResponse.data.pipe(writer);

      writer.on("finish", () => {
        const stream = fs.createReadStream(imagePath);
        message.reply({
          body: "",
          attachment: stream
        });
      });
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | ওই মাদারচোদ তোর ভাগ্য খারাপ পিক বানাইতে পারিনি.");
    }
  }
};

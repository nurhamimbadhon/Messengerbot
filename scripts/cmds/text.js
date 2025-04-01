const axios = require("axios");
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

// You'll need to install these packages:
// npm install axios fs-extra fluent-ffmpeg @ffmpeg-installer/ffmpeg node-fetch speech-to-text

let ffmpegPath;
try {
  ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  ffmpeg.setFfmpegPath(ffmpegPath);
} catch (error) {
  console.error("FFmpeg not found. Please install @ffmpeg-installer/ffmpeg");
}

module.exports = {
  config: {
    name: "text",
    aliases: ["text", "transcribe", "extract"],
    description: "Convert video/audio to text",
    version: "1.0",
    author: "dipto",
    countDown: 20,
    description: {
      en: "Reply to a video or audio to extract text"
    },
    category: "media",
    guide: {
      en: "{p}{n}"
    },
    noPrefix: true
  },
  
  onChat: async function({ api, event, args, message, client }) {
    const nonPrefixCommands = ["text", "transcribe", "extract"];
    const prefixCommands = ["/text", "/transcribe", "/extract"];
    const input = event.body?.trim().toLowerCase();
    if (!input || (!nonPrefixCommands.some(cmd => input === cmd) && !prefixCommands.some(cmd => input === cmd))) {
      return;
    }
    
    if (nonPrefixCommands.some(cmd => input === cmd)) {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return;
      }
      
      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "video" && attachment.type !== "audio") {
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
          message.reply("Please reply to a video or audio file to extract text from it.");
        }
        return;
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "video" && attachment.type !== "audio") {
        if (isPrefix) {
          api.setMessageReaction("❌", event.messageID, (err) => {}, true);
          message.reply("The replied content must be a video or audio file.");
        }
        return;
      }
      
      message.reply("⏳ Processing your media file. This may take a minute...");
      
      // Download the file
      const { data } = await axios.get(attachment.url, { method: 'GET', responseType: 'arraybuffer' });
      
      // Ensure cache directory exists
      if (!fs.existsSync(__dirname + '/cache')) {
        fs.mkdirSync(__dirname + '/cache', { recursive: true });
      }
      
      // Set file paths
      const randomId = Math.floor(Math.random() * 9999999);
      const inputPath = path.join(__dirname, 'cache', `input_${randomId}.${attachment.type === "video" ? "mp4" : "mp3"}`);
      const audioPath = path.join(__dirname, 'cache', `audio_${randomId}.mp3`);
      
      // Write the downloaded file
      fs.writeFileSync(inputPath, Buffer.from(data, 'utf-8'));
      
      // If it's a video, extract the audio
      if (attachment.type === "video") {
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .output(audioPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });
      } else {
        // If it's already audio, just copy it
        fs.copyFileSync(inputPath, audioPath);
      }
      
      // Read the audio file
      const audioBuffer = fs.readFileSync(audioPath);
      
      // Call the speech-to-text API
      try {
        // You'll need to replace this with your preferred STT API
        // Here's an example using a hypothetical API
        const fetch = require('node-fetch');
        
        // Create a FormData object with the audio file
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', audioBuffer, {
          filename: 'audio.mp3',
          contentType: 'audio/mpeg'
        });
        
        // Send to speech-to-text API
        // Replace with your actual API endpoint
        const response = await fetch('https://api.speech-to-text-service.com/transcribe', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY' // Replace with your API key
          }
        });
        
        const result = await response.json();
        
        if (!result.text) {
          throw new Error("Could not extract text from the media file.");
        }
        
        // Detect language (the API might already return this)
        const detectedLanguage = result.language || "Unknown";
        
        // Send the transcribed text to the user
        const messageText = `📝 Extracted Text (${detectedLanguage}):\n\n${result.text}`;
        
        api.sendMessage(messageText, event.threadID, event.messageID);
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      } catch (apiError) {
        console.error("API Error:", apiError);
        message.reply("❌ Error: Could not convert speech to text. Please try again later.");
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      }
      
      // Clean up files
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(audioPath);
      } catch (cleanupErr) {
        console.log("Failed to clean up cache files:", cleanupErr);
      }
      
    } catch (e) {
      console.error("Error in text extraction:", e);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(`❌ Error: ${e.message}`);
    }
  },
};
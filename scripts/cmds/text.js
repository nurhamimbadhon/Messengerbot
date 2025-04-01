const axios = require("axios");
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { franc } = require('franc');
const langs = require('langs');
const FormData = require('form-data');
require('dotenv').config();

// You'll need to install these packages:
// npm install axios fs-extra fluent-ffmpeg @ffmpeg-installer/ffmpeg franc langs form-data dotenv

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
      // Modify ffmpeg to avoid using process.stderr.clearLine
      if (attachment.type === "video") {
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .output(audioPath)
            .on('end', resolve)
            .on('error', reject)
            .outputOptions(['-hide_banner', '-loglevel error']) // Reduce logging
            .run();
        });
      } else {
        // If it's already audio, just copy it
        fs.copyFileSync(inputPath, audioPath);
      }
      
      // Read the audio file
      const audioBuffer = fs.readFileSync(audioPath);
      
      // Call the speech-to-text API using OpenAI's Whisper API
      try {
        const formData = new FormData();
        
        // Add the audio file to the form data
        formData.append('file', audioBuffer, {
          filename: 'audio.mp3',
          contentType: 'audio/mpeg'
        });
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        
        // Get the API key - first check environment variable, then config file
        let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        
        // If no API key in environment, check if there's a config file
        if (!OPENAI_API_KEY) {
          try {
            const configPath = path.join(__dirname, '..', 'config.json');
            if (fs.existsSync(configPath)) {
              const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
              OPENAI_API_KEY = configData.OPENAI_API_KEY;
            }
          } catch (configErr) {
            console.error("Error reading config file:", configErr);
          }
        }
        
        if (!OPENAI_API_KEY) {
          throw new Error("OpenAI API key not found. Please set OPENAI_API_KEY in your .env file or config.json");
        }
        
        // Send to OpenAI Whisper API
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', 
          formData, 
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              ...formData.getHeaders()
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          }
        );
        
        const result = response.data;
        
        if (!result.text) {
          throw new Error("Could not extract text from the media file.");
        }
        
        // We'll use franc to detect the language from the text
        // Detect language using franc
        const langCode = franc(result.text);
        let detectedLanguage = "Auto-detected";
        
        if (langCode !== 'und') {
          try {
            const language = langs.where('3', langCode);
            if (language) {
              detectedLanguage = language.name;
            }
          } catch (langError) {
            console.log("Language detection error:", langError);
          }
        }
        
        // Send the transcribed text to the user
        const messageText = `📝 Extracted Text (${detectedLanguage}):\n\n${result.text}`;
        
        api.sendMessage(messageText, event.threadID, event.messageID);
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      } catch (apiError) {
        console.error("API Error:", apiError);
        let errorMessage = "❌ Error: Could not convert speech to text.";
        
        // Provide more specific error messages for common issues
        if (apiError.response) {
          const status = apiError.response.status;
          if (status === 401) {
            errorMessage = "❌ Error: Invalid API key. Please check your OpenAI API key.";
          } else if (status === 429) {
            errorMessage = "❌ Error: API rate limit exceeded. Please try again later.";
          } else if (apiError.response.data && apiError.response.data.error) {
            errorMessage = `❌ Error: ${apiError.response.data.error.message}`;
          }
        }
        
        message.reply(errorMessage);
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
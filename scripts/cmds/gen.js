const models = [
  'DreamShaper',
  'MBBXL_Ultimate',
  'Mysterious',
  'Copax_TimeLessXL',
  'Pixel_Art_XL',
  'ProtoVision_XL',
  'SDXL_Niji',
  'CounterfeitXL',
  'DucHaiten_AIart_SDXL'
];

module.exports = {
  config: {
    name: "gen",
    version: "1.1",
    author: "RedWan×MAHI×Sanam",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate AI images from text prompts using various models"
    },
    category: "AI",
    guide: {
      en: "{pn} [prompt] | [model number/name]\n\n" +
          "📝 Available Models:\n" + 
          models.map((item, index) => `➤ ${index + 1}. ${item}`).join('\n') +
          "\n\nExample: {pn} cute cat wearing sunglasses | 3"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return message.reply("🔍 Please provide a text prompt. Example:\n/gen cute panda astronaut | 2");
      }

      // Parse prompt and model
      let prompt, model;
      if (text.includes("|")) {
        const parts = text.split("|").map(part => part.trim());
        prompt = parts[0];
        const modelInput = parts[1];
        
        // Check if input is a model number
        const modelNum = parseInt(modelInput);
        if (!isNaN(modelNum) {
          if (modelNum < 1 || modelNum > models.length) {
            return message.reply(`❌ Invalid model number. Please choose 1-${models.length}.\n` + 
                               models.map((m, i) => `${i + 1}. ${m}`).join('\n'));
          }
          model = models[modelNum - 1];
        } else {
          // Check if input is a valid model name
          if (!models.includes(modelInput)) {
            return message.reply(`❌ Unknown model. Available models:\n` + 
                               models.map((m, i) => `${i + 1}. ${m}`).join('\n'));
          }
          model = modelInput;
        }
      } else {
        prompt = text;
        model = "DreamShaper"; // Default model
      }

      // Show processing status
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const processingMsg = await message.reply(`🔄 Generating "${prompt}" using ${model}...`);

      // API call with timeout
      const APIUrl = `https://www.api.vyturex.com/curios?prompt=${encodeURIComponent(prompt)}&modelType=${model}`;
      
      try {
        const imageStream = await global.utils.getStreamFromURL(APIUrl);
        
        // Verify the image is valid
        if (!imageStream) throw new Error("Empty response from API");
        
        await message.reply({
          body: `🎨 Generated: "${prompt}"\n🖌️ Model: ${model}`,
          attachment: imageStream
        });
        
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } catch (apiError) {
        throw new Error(`API request failed: ${apiError.message}`);
      }

      // Clean up processing message
      await api.unsendMessage(processingMsg.messageID);

    } catch (error) {
      console.error("Generation Error:", error);
      
      // User-friendly error messages
      const errorMessages = {
        "blocked": "⚠️ Your prompt was blocked. Try different wording.",
        "timeout": "⏳ The request timed out. Please try again.",
        "default": "❌ Generation failed. Possible reasons:\n" +
                  "- The prompt may be blocked\n" +
                  "- Server is busy\n" +
                  "- Try a simpler prompt\n\n" +
                  "Example: /gen sunset over mountains | 1"
      };
      
      let response = errorMessages.default;
      if (error.message.includes("blocked")) response = errorMessages.blocked;
      if (error.message.includes("timeout")) response = errorMessages.timeout;
      
      message.reply(response);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
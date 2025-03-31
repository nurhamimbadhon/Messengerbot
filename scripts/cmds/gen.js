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
    version: "1.0",
    author: "RedWan×MAHI×Sanam",
    countDown: 5,
    role: 0,
    longDescription: {
      en: "Generate images from text prompts using AI models",
    },
    category: "Image~Create",
    guide: {
      en: "Type {pn} [prompt] | [model number/name]\nSupported models:\n" + models.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    },
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return message.reply("⚠️ Please provide a text prompt.");
      }

      let prompt, model;
      if (text.includes("|")) {
        const [promptText, modelText] = text.split("|").map((str) => str.trim());
        prompt = promptText;
        model = modelText;

        // Handle model selection by number
        const modelNumber = parseInt(model);
        if (!isNaN(modelNumber) && modelNumber >= 1 && modelNumber <= models.length) {
          model = models[modelNumber - 1];
        } else if (!models.includes(model)) {
          return message.reply(`❌ Invalid model. Supported models:\n${models.map((m, i) => `${i + 1}. ${m}`).join('\n')}`);
        }
      } else {
        prompt = text;
        model = "DreamShaper"; // Default model
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const processingMsg = await message.reply("🔄 Generating your image...");

      const APIUrl = `https://www.api.vyturex.com/curios?prompt=${encodeURIComponent(prompt)}&modelType=${model}`;
      const imageStream = await global.utils.getStreamFromURL(APIUrl);

      await message.reply({
        attachment: imageStream,
        body: `🖼️ Generated using ${model} model`
      });
      
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await api.unsendMessage(processingMsg.messageID);

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred. Please try again with a different prompt.");
    }
  }
};
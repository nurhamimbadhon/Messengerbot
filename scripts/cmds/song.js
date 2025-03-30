const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "song",
    version: "1.0.0",
    aliases: ["mp3", "audio"],
    author: "dipto",
    countDown: 5,
    role: 0,
    description: {
      en: "Download audio (MP3) from YouTube",
    },
    category: "media",
    guide: {
      en: "  {pn} [<video name>|<video link>]: use to download audio from YouTube."
          + "\n   Example:"
          + "\n {pn} despacito"
          + "\n {pn} https://youtu.be/abc123xyz",
    },
  },

  onStart: async ({ api, args, event }) => {
  api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    if (args.length === 0) {
      return api.sendMessage("❌ Please provide a YouTube video name or link.", event.threadID, event.messageID);
    }

    const checkurl =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    
    let videoID;
    if (checkurl.test(args[0])) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
    } else {
      const searchQuery = args.join(" ");
      try {
        const searchResults = await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${searchQuery}`);
        if (!searchResults.data.length) {
          return api.sendMessage(`⭕ No search results found for: ${searchQuery}`, event.threadID, event.messageID);
        }
        videoID = searchResults.data[0].id;
      } catch (error) {
        return api.sendMessage("❌ An error occurred while searching.", event.threadID, event.messageID);
      }
    }

    try {
      const format = "mp3";
      const path = `yt_audio_${videoID}.${format}`;
      const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);
      
      await api.sendMessage({
        body: `🎵 Title: ${title}\n🎧 Quality: ${quality}`,
        attachment: await downloadFile(downloadLink, path),
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Failed to download the audio. Please try again later.", event.threadID, event.messageID);
    }
  },
};

async function downloadFile(url, pathName) {
  try {
    const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
	    }

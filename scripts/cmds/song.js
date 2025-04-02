const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json";

const fetchApis = async () => {
  const { data } = await axios.get(API_URL);
  return { searchApi: data.api, downloadApi: data.alldl };
};

module.exports.config = {
  name: "song",
  aliases: ["songs", "sing"],
  version: "1.6.9",
  author: "𝗦𝗵𝗔𝗻",
  role: 0,
  countDown: 9,
  category: "𝗠𝗘𝗗𝗜𝗔",
  guide: { en: "{pn} [song name] or reply with a link" }
};

module.exports.onStart = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;
  let query = args.join(" ");
  let ytUrl = "";
  let id = "";

  const ytMatch = messageReply?.body?.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/\S+/gi) || 
                  query.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/\S+/gi);

  if (ytMatch) {
    ytUrl = ytMatch[0];
    const ytIdMatch = ytUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (ytIdMatch) id = ytIdMatch[1];
  } 

  if (!ytUrl && !query) {
    return api.sendMessage("❌ Provide a song name or YouTube link.", threadID, messageID);
  }

  api.setMessageReaction("🎤", messageID, () => {}, true);

  try {
    const { searchApi, downloadApi } = await fetchApis();

    if (!id) {
      const res = await axios.get(`${searchApi}/nazrul/ytSearchx?name=${encodeURIComponent(query)}`);
      if (!res.data.result?.length) throw new Error("No results found.");

      const randomIndex = Math.floor(Math.random() * Math.min(3, res.data.result.length));
      id = res.data.result[randomIndex].id;
    }

    const { data: mp3Data } = await axios.get(`${downloadApi}/nazrul/ytMp3x?id=${id}`);
    if (!mp3Data?.url) throw new Error("Download link not found!");

    const filePath = path.join(__dirname, "song.mp3");
    const writer = fs.createWriteStream(filePath);

    (await axios.get(mp3Data.url, { responseType: "stream" })).data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({ body: `🎶 Title: ${mp3Data.title}`, attachment: fs.createReadStream(filePath) }, threadID, () => {
        fs.unlinkSync(filePath);
        api.setMessageReaction("✅", messageID, () => {}, true);
      }, messageID);
    });

    writer.on("error", (err) => {
      throw new Error("File download error: " + err.message);
    });

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`Error: ${err.message}`, threadID, messageID);
  }
};
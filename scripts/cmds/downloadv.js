const axios = require("axios");

const dApi = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json");
  return base.data.alldl;
};

module.exports.config = {
  name: "downloadv",
  version: "2.0",
  author: "Nur Hamim",
  role: 0,
  description: "Automatically download videos from supported platforms!",
  category: "𝗠𝗘𝗗𝗜𝗔",
  countDown: 10,
  guide: {
    en: "Send a valid video link from supported platforms (TikTok, Facebook, YouTube, Twitter, Instagram, etc.), and the bot will download it automatically.\n/d {link} - Download video\n/aon - Turn auto download mode on\n/aoff - Turn auto download mode off",
  },
};

const autoDownloadEnabled = new Map();

module.exports.onStart = async ({ message, args, event, api }) => {
  const { threadID, messageID } = event;
  if (args[0] === "-aon" || args[0] === "aon") {
    autoDownloadEnabled.set(threadID, true);
    return api.sendMessage("✅ Auto download mode turned ON", threadID, messageID);
  }
  if (args[0] === "-aoff" || args[0] === "aoff") {
    autoDownloadEnabled.delete(threadID);
    return api.sendMessage("❌ Auto download mode turned OFF", threadID, messageID);
  }
  let url = args[0];
  if (!url && event.type === "message_reply" && event.messageReply.body) {
    const urlMatch = event.messageReply.body.match(/https?:\/\/[^\s]+/);
    if (urlMatch) url = urlMatch[0];
  }
  if (!url) {
    return api.sendMessage("❓ Please provide a valid URL to download", threadID, messageID);
  }
  const platformMatch = detectPlatform(url);
  if (!platformMatch) {
    return api.sendMessage("❌ Unsupported platform. Please use a link from TikTok, Facebook, YouTube, Twitter, or Instagram.", threadID, messageID);
  }
  try {
    await downloadAndSend(url, api, threadID, messageID);
  } catch (error) {
    console.error(`❌ Error while processing the URL:`, error.message);
    api.sendMessage(`❌ Failed to download: ${error.message}`, threadID, messageID);
  }
};

const platforms = {
  TikTok: { regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com/, endpoint: "/nazrul/tikDL?url=" },
  Facebook: { regex: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch|facebook\.com\/share\/v)/, endpoint: "/nazrul/fbDL?url=" },
  YouTube: { regex: /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)/, endpoint: "/nazrul/ytDL?uri=" },
  Twitter: { regex: /(?:https?:\/\/)?(?:www\.)?x\.com/, endpoint: "/nazrul/alldl?url=" },
  Instagram: { regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com/, endpoint: "/nazrul/instaDL?url=" },
};

const detectPlatform = (url) => {
  for (const [platform, data] of Object.entries(platforms)) {
    if (data.regex.test(url)) {
      return { platform, endpoint: data.endpoint };
    }
  }
  return null;
};

const downloadVideo = async (apiUrl, url) => {
  const match = detectPlatform(url);
  if (!match) throw new Error("No matching platform for the provided URL.");
  const { platform, endpoint } = match;
  const endpointUrl = `${apiUrl}${endpoint}${encodeURIComponent(url)}`;
  console.log(`🔗 Fetching from: ${endpointUrl}`);
  try {
    const res = await axios.get(endpointUrl);
    console.log(`✅ API Response:`, res.data);
    const videoUrl = res.data?.videos?.[0]?.url || res.data?.url;
    if (videoUrl) return { downloadUrl: videoUrl, platform };
  } catch (error) {
    console.error(`❌ Error fetching data from ${endpointUrl}:`, error.message);
    throw new Error("Download link not found.");
  }
  throw new Error("No video URL found in the API response.");
};

const downloadAndSend = async (url, api, threadID, messageID) => {
  try {
    const apiUrl = await dApi();
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const { downloadUrl, platform } = await downloadVideo(apiUrl, url);
    const videoStream = await axios.get(downloadUrl, { responseType: "stream" });
    api.sendMessage({ body: `✅ Downloaded From ${platform}`, attachment: [videoStream.data] }, threadID, messageID);
  } catch (error) {
    console.error(`❌ Error while processing the URL:`, error.message);
    throw error;
  }
};

module.exports.onChat = async ({ api, event }) => {
  const { body, threadID, messageID } = event;
  if (body === "-aon") {
    autoDownloadEnabled.set(threadID, true);
    return api.sendMessage("✅ Auto download mode turned ON", threadID, messageID);
  }
  if (body === "-aoff") {
    autoDownloadEnabled.delete(threadID);
    return api.sendMessage("❌ Auto download mode turned OFF", threadID, messageID);
  }
  if (body.startsWith("-d ")) {
    const url = body.substring(3).trim();
    const platformMatch = detectPlatform(url);
    if (!platformMatch) {
      return api.sendMessage("❌ Unsupported platform. Please use a link from TikTok, Facebook, YouTube, Twitter, or Instagram.", threadID, messageID);
    }
    try {
      await downloadAndSend(url, api, threadID, messageID);
    } catch (error) {
      api.sendMessage(`❌ Failed to download: ${error.message}`, threadID, messageID);
    }
    return;
  }
  if (body === "-d" && event.type === "message_reply" && event.messageReply.body) {
    const urlMatch = event.messageReply.body.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) {
      return api.sendMessage("❌ No valid URL found in the replied message.", threadID, messageID);
    }
    const url = urlMatch[0];
    const platformMatch = detectPlatform(url);
    if (!platformMatch) {
      return api.sendMessage("❌ Only supported from TikTok, Facebook, YouTube, Twitter, Instagram.", threadID, messageID);
    }
    try {
      await downloadAndSend(url, api, threadID, messageID);
    } catch (error) {
      api.sendMessage(`❌ Failed to download: ${error.message}`, threadID, messageID);
    }
    return;
  }
  if (!autoDownloadEnabled.get(threadID)) return;
  const urlMatch = body.match(/https?:\/\/[^\s]+/);
  if (!urlMatch) return;
  try {
    await downloadAndSend(urlMatch[0], api, threadID, messageID);
  } catch (error) {
    console.error(`❌ Error while processing the URL in auto mode:`, error.message);
  }
};

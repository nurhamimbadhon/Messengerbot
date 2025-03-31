const axios = require("axios");

let autoDownloadStatus = {}; // Stores auto-download status per thread

const dApi = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json"
  );
  return base.data.alldl;
};

module.exports.config = {
  name: "autodl",
  version: "2.0.0",
  author: "Nur hamim",
  role: 0,
  description: "Auto-download videos with toggle functionality",
  category: "𝗠𝗘𝗗𝗜𝗔",
  countDown: 5,
  guide: {
    en: "{pn} [aon|aoff] or /dn [link]"
  }
};

const platforms = {
  TikTok: {
    regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com/,
    endpoint: "/nazrul/tikDL?url="
  },
  Facebook: {
    regex: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch|facebook\.com\/share\/v)/,
    endpoint: "/nazrul/fbDL?url="
  },
  YouTube: {
    regex: /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)/,
    endpoint: "/nazrul/ytDL?uri="
  },
  Twitter: {
    regex: /(?:https?:\/\/)?(?:www\.)?(x\.com|twitter\.com)/,
    endpoint: "/nazrul/alldl?url="
  },
  Instagram: {
    regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com/,
    endpoint: "/nazrul/instaDL?url="
  }
};

const detectPlatform = (url) => {
  for (const [platform, data] of Object.entries(platforms)) {
    if (data.regex.test(url)) return { platform, endpoint: data.endpoint };
  }
  return null;
};

const downloadVideo = async (apiUrl, url) => {
  const match = detectPlatform(url);
  if (!match) throw new Error("Unsupported platform");

  const { platform, endpoint } = match;
  const endpointUrl = `${apiUrl}${endpoint}${encodeURIComponent(url)}`;
  
  try {
    const res = await axios.get(endpointUrl);
    return {
      downloadUrl: res.data?.videos?.[0]?.url || res.data?.url,
      platform
    };
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
};

async function processDownload(url, api, event, messageIDToEdit) {
  try {
    const apiUrl = await dApi();
    await api.setMessageReaction("⏳", event.messageID, () => {}, true);
    
    const { downloadUrl, platform } = await downloadVideo(apiUrl, url);
    const videoStream = await axios.get(downloadUrl, { responseType: "stream" });

    await api.sendMessage({
      body: `✅ Successfully downloaded from ${platform}`,
      attachment: videoStream.data
    }, event.threadID, messageIDToEdit);
    
    await api.setMessageReaction("✅", event.messageID, () => {}, true);
  } catch (error) {
    await api.sendMessage(`❌ Error: ${error.message}`, event.threadID, messageIDToEdit);
    await api.setMessageReaction("❌", event.messageID, () => {}, true);
  }
}

module.exports.onStart = function({}) {};

module.exports.onChat = async ({ api, event }) => {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // Command handling
  if (body.toLowerCase().startsWith('/aon')) {
    autoDownloadStatus[threadID] = true;
    return api.sendMessage("🟢 Auto-Download Mode ACTIVATED\nNow I'll automatically download any supported links!", threadID, messageID);
  }
  
  if (body.toLowerCase().startsWith('/aoff')) {
    autoDownloadStatus[threadID] = false;
    return api.sendMessage("🔴 Auto-Download Mode DEACTIVATED\nUse '/dn [link]' to download manually.", threadID, messageID);
  }
  
  if (body.toLowerCase().startsWith('/dn')) {
    const urlMatch = body.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return api.sendMessage("⚠️ Please provide a valid URL after /dn", threadID, messageID);
    
    const processingMsg = await api.sendMessage("⏳ Downloading...", threadID);
    return processDownload(urlMatch[0], api, event, processingMsg.messageID);
  }

  // Auto-download handling
  if (autoDownloadStatus[threadID]) {
    const urlMatch = body.match(/https?:\/\/[^\s]+/);
    if (urlMatch && detectPlatform(urlMatch[0])) {
      const processingMsg = await api.sendMessage("🔄 Auto-detected media link, downloading...", threadID);
      return processDownload(urlMatch[0], api, event, processingMsg.messageID);
    }
  }
};
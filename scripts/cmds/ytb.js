const axios = require("axios");
const fs = require('fs');
const ytdl = require('ytdl-core');
const yts = require('yt-search'); // For fallback search

const baseApiUrl = async () => {
  try {
    const base = await axios.get(
      `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`,
      { timeout: 5000 }
    );
    return base.data.api;
  } catch (e) {
    console.error("Failed to get base API URL, using fallback");
    return "https://api.dipto-007.repl.co";
  }
};

async function downloadFile(url, pathName) {
  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 30000
    });
    
    const writer = fs.createWriteStream(pathName);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  config: {
    name: "ytb",
    aliases: ["sings", "youtube"],
    version: "1.2.0", // Updated version
    author: "dipto",
    countDown: 5,
    role: 0,
    description: {
      en: "Download video, audio, and info from YouTube"
    },
    category: "media",
    guide: {
      en: "  {pn} [video|-v] [<video name>|<video link>]: use to download video from YouTube."
        + "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from YouTube"
        + "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from YouTube"
        + "\n   Example:"
        + "\n    {pn} -v https://youtu.be/8PtPhk6cJoQ"
        + "\n    {pn} -a Paro"
    }
  },

  onStart: async function ({ api, args, event, commandName }) {
    try {
      if (args.length === 0) {
        return api.sendMessage("❌ Please specify an action (video/audio/info) and search query/link.", event.threadID, event.messageID);
      }

      const action = args[0].toLowerCase();
      if (!['-v', 'video', '-a', 'audio', '-i', 'info'].includes(action)) {
        return api.sendMessage("❌ Invalid action. Use -v for video, -a for audio, or -i for info.", event.threadID, event.messageID);
      }

      args.shift();
      if (args.length === 0) {
        return api.sendMessage("❌ Please provide a YouTube link or search query.", event.threadID, event.messageID);
      }

      const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
      const urlYtb = checkurl.test(args[0]);
      let videoID;

      if (urlYtb) {
        const match = args[0].match(checkurl);
        videoID = match ? match[1] : null;

        if (action === '-v' || action === 'video' || action === '-a' || action === 'audio') {
          api.sendMessage("⏳ Processing your request. This may take a moment...", event.threadID, event.messageID);
          
          try {
            return await this.handleDirectDownload(api, event, videoID, action);
          } catch (e) {
            console.error("Primary download failed, trying alternative API:", e);
            try {
              return await this.alternativeApiDownload(api, event, videoID, action);
            } catch (altError) {
              console.error("Alternative API failed, trying ytdl fallback:", altError);
              return await this.fallbackDownload(api, event, videoID, action);
            }
          }
        } else if (action === '-i' || action === 'info') {
          return await this.handleVideoInfo(api, event, videoID);
        }
      } else {
        return await this.handleSearch(api, event, args.join(" "), action, commandName);
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ An error occurred: " + err.message, event.threadID, event.messageID);
    }
  },

  handleDirectDownload: async function (api, event, videoID, action) {
    try {
      const format = (action === '-a' || action === 'audio') ? 'mp3' : 'mp4';
      const path = `ytb_${format}_${videoID}.${format}`;
      
      const apiUrl = await baseApiUrl();
      const { data } = await axios.get(`${apiUrl}/ytDl3?link=${videoID}&format=${format}&quality=3`, {
        timeout: 15000 // Increased timeout
      });
      
      if (!data || !data.downloadLink) {
        throw new Error("Invalid response from API");
      }

      await api.sendMessage({
        body: `• Title: ${data.title || 'Unknown'}\n• Quality: ${data.quality || 'Unknown'}`,
        attachment: await downloadFile(data.downloadLink, path)
      }, event.threadID, () => {
        try {
          fs.unlinkSync(path);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      }, event.messageID);
    } catch (e) {
      throw e;
    }
  },

  // Added a new alternative API method as an intermediate fallback
  alternativeApiDownload: async function (api, event, videoID, action) {
    try {
      const format = (action === '-a' || action === 'audio') ? 'mp3' : 'mp4';
      const path = `ytb_${format}_${videoID}.${format}`;
      
      // Use a different API as an alternative - this is an example, replace with a working API
      const apiUrl = `https://y2mate-api.onrender.com/api/convert?url=https://www.youtube.com/watch?v=${videoID}&format=${format}`;
      const { data } = await axios.get(apiUrl, {
        timeout: 20000
      });
      
      if (!data || !data.url) {
        throw new Error("Invalid response from alternative API");
      }

      await api.sendMessage({
        body: `• Title: ${data.title || 'Unknown'}\n• Quality: ${data.quality || data.resolution || 'Standard'}`,
        attachment: await downloadFile(data.url, path)
      }, event.threadID, () => {
        try {
          fs.unlinkSync(path);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      }, event.messageID);
    } catch (e) {
      throw e;
    }
  },

  fallbackDownload: async function (api, event, videoID, action) {
    try {
      const format = (action === '-a' || action === 'audio') ? 'mp3' : 'mp4';
      const path = `ytb_${format}_${videoID}.${format}`;
      
      const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
      const info = await ytdl.getInfo(videoUrl);
      const title = info.videoDetails.title;
      
      // More specific format selection instead of just 'highest'
      let qualityOptions;
      
      if (format === 'mp3') {
        // For audio, select the best audio format
        qualityOptions = {
          quality: 'highestaudio',
          filter: 'audioonly'
        };
      } else {
        // For video, try to find a good balance of quality and compatibility
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        
        // Sort formats by quality (resolution) descending
        formats.sort((a, b) => {
          return parseInt(b.height || 0) - parseInt(a.height || 0);
        });
        
        // Try to select a reasonable quality (not the absolute highest)
        // to avoid issues with very large files or restricted formats
        const preferredFormats = formats.filter(f => 
          parseInt(f.height || 0) <= 720 && 
          f.container === 'mp4'
        );
        
        const format = preferredFormats.length > 0 ? preferredFormats[0] : formats[0];
        
        qualityOptions = {
          quality: format.itag,
          filter: 'videoandaudio'
        };
      }
      
      // Add a timeout to avoid hanging downloads
      const downloadTimeout = setTimeout(() => {
        throw new Error("Download timed out after 60 seconds");
      }, 60000);
      
      const stream = ytdl(videoUrl, qualityOptions).pipe(fs.createWriteStream(path));
      
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      
      clearTimeout(downloadTimeout);

      await api.sendMessage({
        body: `• Title: ${title}\n• Downloaded using fallback method`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => {
        try {
          fs.unlinkSync(path);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      }, event.messageID);
    } catch (e) {
      // If ytdl fails, provide a more user-friendly message
      console.error("Fallback download failed:", e);
      api.sendMessage({
        body: "❌ Sorry, I couldn't download this video. YouTube may have changed their systems recently. Try again later or with a different video.",
      }, event.threadID, event.messageID);
    }
  },

  handleVideoInfo: async function (api, event, videoID) {
    try {
      const apiUrl = await baseApiUrl();
      const { data } = await axios.get(`${apiUrl}/ytfullinfo?videoID=${videoID}`, {
        timeout: 10000
      });

      if (!data) {
        throw new Error("No data received from API");
      }

      // Create a temporary file for the thumbnail
      const thumbPath = `info_thumb_${Date.now()}.jpg`;
      
      await api.sendMessage({
        body: `✨ | Title: ${data.title}\n⏳ | Duration: ${(data.duration / 60).toFixed(2)} minutes\n📺 | Resolution: ${data.resolution}\n👀 | Views: ${data.view_count}\n👍 | Likes: ${data.like_count}\n📝 | Comments: ${data.comment_count}\n🔗 | Video URL: ${data.webpage_url}`,
        attachment: await downloadFile(data.thumbnail, thumbPath)
      }, event.threadID, () => {
        try {
          fs.unlinkSync(thumbPath);
        } catch (e) {
          console.error("Error deleting thumbnail:", e);
        }
      }, event.messageID);
    } catch (e) {
      console.error(e);
      try {
        const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoID}`);
        await api.sendMessage({
          body: `✨ | Title: ${info.videoDetails.title}\n⏳ | Duration: ${(info.videoDetails.lengthSeconds / 60).toFixed(2)} minutes\n👀 | Views: ${info.videoDetails.viewCount}\n👍 | Likes: ${info.videoDetails.likes || 'N/A'}\n📝 | Comments: ${info.videoDetails.commentCount || 'N/A'}\n🔗 | Video URL: https://youtu.be/${videoID}`,
        }, event.threadID, event.messageID);
      } catch (fallbackError) {
        await api.sendMessage({
          body: "❌ Sorry, I couldn't retrieve info for this video. YouTube may have changed their systems recently.",
        }, event.threadID, event.messageID);
      }
    }
  },

  handleSearch: async function (api, event, query, action, commandName) {
    try {
      const maxResults = 6;
      let result;
      
      // Try primary search API first
      try {
        const apiUrl = await baseApiUrl();
        const response = await axios.get(`${apiUrl}/ytFullSearch?songName=${encodeURIComponent(query)}`, {
          timeout: 10000
        });
        result = response.data.slice(0, maxResults);
      } catch (apiError) {
        console.error("Primary search API failed, using yt-search fallback");
        // Fallback to yt-search
        const searchResults = await yts(query);
        result = searchResults.videos.slice(0, maxResults).map(video => ({
          id: video.videoId,
          title: video.title,
          time: video.timestamp || video.duration.toString(),
          thumbnail: video.thumbnail,
          channel: {
            name: video.author.name
          }
        }));
      }

      if (result.length === 0) {
        return api.sendMessage("⭕ No search results match the keyword: " + query, event.threadID, event.messageID);
      }

      let msg = "Search Results:\n\n";
      let i = 1;
      const thumbnails = [];
      const thumbnailPaths = [];
      
      for (const info of result) {
        const thumbPath = `thumbnail_${i}_${Date.now()}.jpg`;
        thumbnailPaths.push(thumbPath);
        thumbnails.push(downloadFile(info.thumbnail, thumbPath));
        msg += `${i++}. ${info.title}\n⏱️ Duration: ${info.time}\n📺 Channel: ${info.channel.name}\n\n`;
      }

      api.sendMessage({
        body: msg + "Reply to this message with a number to choose",
        attachment: await Promise.all(thumbnails)
      }, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          result,
          action,
          thumbnailPaths // Save paths for cleanup
        });
      }, event.messageID);
    } catch (err) {
      console.error(err);
      throw new Error("Search failed: " + err.message);
    }
  },

  onReply: async function ({ event, api, Reply }) {
    try {
      const { result, action, thumbnailPaths } = Reply;
      const choice = parseInt(event.body);

      // Cleanup thumbnail files if they exist
      if (thumbnailPaths && Array.isArray(thumbnailPaths)) {
        thumbnailPaths.forEach(path => {
          try {
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          } catch (err) {
            console.error(`Error deleting thumbnail ${path}:`, err);
          }
        });
      }

      if (isNaN(choice)) {
        return api.sendMessage('❌ Please reply with a number to choose from the list.', event.threadID, event.messageID);
      }

      if (choice <= 0 || choice > result.length) {
        return api.sendMessage('❌ Invalid choice. Please select a number between 1 and ' + result.length, event.threadID, event.messageID);
      }

      const selectedVideo = result[choice - 1];
      const videoID = selectedVideo.id;

      if (action === '-v' || action === 'video' || action === 'mp4' || action === '-a' || action === 'audio' || action === 'mp3' || action === 'music') {
        try {
          await api.unsendMessage(Reply.messageID);
          api.sendMessage("⏳ Processing your request. This may take a moment...", event.threadID, event.messageID);
          
          try {
            return await this.handleDirectDownload(api, event, videoID, action);
          } catch (e) {
            console.error("Primary download failed, trying alternative API:", e);
            try {
              return await this.alternativeApiDownload(api, event, videoID, action);
            } catch (altError) {
              console.error("Alternative API failed, trying ytdl fallback:", altError);
              return await this.fallbackDownload(api, event, videoID, action);
            }
          }
        } catch (e) {
          console.error("All download methods failed:", e);
          return api.sendMessage("❌ Sorry, I couldn't download this video after trying multiple methods. YouTube may have changed their systems recently.", event.threadID, event.messageID);
        }
      } else if (action === '-i' || action === 'info') {
        await api.unsendMessage(Reply.messageID);
        return await this.handleVideoInfo(api, event, videoID);
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ An error occurred while processing your request: " + err.message, event.threadID, event.messageID);
    }
  }
};
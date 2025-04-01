const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "send",
    version: "1.0",
    author: "𝗡𝘂𝗿 𝗛𝗮𝗺𝗶𝗺",
    countDown: 1,
    role: 0,
    category: "owner",
  },
  onStart: async function({ message, event, api }) {
    // Owner ID - only this person can use the command
    const ownerID = "100034630383353";
    
    // Check if the command user is the owner
    if (event.senderID !== ownerID) {
      return;
    }
    if (!event.messageReply) {
      api.sendMessage("You need to reply to a message to forward it.", ownerID);
      return;
    }
    
    try {
      const repliedMsg = event.messageReply;
      const threadInfo = await api.getThreadInfo(event.threadID).catch(() => ({ threadName: "Unknown Group" }));
      const senderInfo = await api.getUserInfo(repliedMsg.senderID).catch(() => ({ [repliedMsg.senderID]: { name: "Unknown" } }));
      const senderName = senderInfo[repliedMsg.senderID]?.name || "Unknown";
      const groupName = threadInfo.threadName || "Unknown Group";
      
      let forwardHeader = `🔄 𝗙𝗼𝗿𝘄𝗮𝗿𝗱𝗲𝗱 𝗙𝗿𝗼𝗺: ${senderName}\n👥 𝗚𝗿𝗼𝘂𝗽: ${groupName}\n⏰ ${new Date(repliedMsg.timestamp).toLocaleString()}\n\n`;
      
      // Check what type of content is in the replied message
      if (repliedMsg.attachments && repliedMsg.attachments.length > 0) {
        for (const attachment of repliedMsg.attachments) {
          if (repliedMsg.body && repliedMsg.body.trim() !== "") {
            forwardHeader += `📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${repliedMsg.body}\n\n`;
          }
          
          let attachmentMsg = forwardHeader + `📎 ${attachment.type}`;
          
          if (["photo", "video", "audio", "sticker", "file", "animated_image"].includes(attachment.type)) {
            try {
              await api.sendMessage(attachmentMsg, ownerID);
              
              const attachmentUrl = attachment.url;
              
              const cachePath = __dirname + "/cache";
              if (!fs.existsSync(cachePath)) {
                fs.mkdirSync(cachePath, { recursive: true });
              }
              
              let fileExtension = "bin";
              if (attachment.type === "photo") fileExtension = "jpg";
              if (attachment.type === "animated_image") fileExtension = "gif";
              if (attachment.type === "audio") fileExtension = "mp3";
              if (attachment.type === "video") fileExtension = "mp4";
              
              const attachmentPath = `${cachePath}/${Date.now()}.${fileExtension}`;
              
              // Download the file
              const { data } = await axios.get(attachmentUrl, { responseType: "arraybuffer" });
              fs.writeFileSync(attachmentPath, Buffer.from(data, "utf-8"));

              // Send the downloaded file
              await api.sendMessage({ attachment: fs.createReadStream(attachmentPath) }, ownerID);
              
              // Clean up downloaded file
              try {
                fs.unlinkSync(attachmentPath);
              } catch (unlinkError) {
                console.error("Failed to delete attachment:", unlinkError);
              }
            } catch (attachmentError) {
              await api.sendMessage(attachmentMsg + "\n(Error sending attachment: " + attachmentError.message + ")", ownerID);
            }
          } else {
            await api.sendMessage(attachmentMsg + "\n(Unsupported attachment type)", ownerID);
          }
        }
      } else if (repliedMsg.body && repliedMsg.body.trim() !== "") {
        const messageToForward = forwardHeader + `📝 Message: ${repliedMsg.body}`;
        await api.sendMessage(messageToForward, ownerID);
      } else {
        await api.sendMessage("Received an empty message with no attachments.", ownerID);
      }
    } catch (error) {
      console.error("Error forwarding message:", error);
      await api.sendMessage("An error occurred while forwarding the message.", ownerID);
    }
  }
};
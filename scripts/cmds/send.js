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
    guide: "Reply to a message and use the command. Only the owner (ID: 100034630383353) can use or request help for this command."
  },
  onStart: async function({ message, event, api }) {
    // Owner ID - only this person can use the command or see help
    const ownerID = "100034630383353";
    
    // If a user requests help (for example, via "/help send") and they're not the owner, ignore it.
    if (event.body && event.body.toLowerCase().includes("/help send") && event.senderID !== ownerID) {
      return;
    }

    // Check if the command user is the owner. If not, ignore.
    if (event.senderID !== ownerID) {
      return;
    }
    
    // Check if the command is a reply to another message
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
      
      let forwardHeader = `🔄 Forwarded From: ${senderName}\n👥 Group: ${groupName}\n⏰ ${new Date(repliedMsg.timestamp).toLocaleString()}\n\n`;
      
      // Check what type of content is in the replied message
      if (repliedMsg.attachments && repliedMsg.attachments.length > 0) {
        for (const attachment of repliedMsg.attachments) {
          // If there is any message text, add it to the header
          if (repliedMsg.body && repliedMsg.body.trim() !== "") {
            forwardHeader += `📝 Message: ${repliedMsg.body}\n\n`;
          }
          
          let attachmentMsg = forwardHeader + `📎 Attachment type: ${attachment.type}`;
          
          if (["photo", "video", "audio", "sticker", "file", "animated_image"].includes(attachment.type)) {
            try {
              // Send the header info first
              await api.sendMessage(attachmentMsg, ownerID);
              
              const attachmentUrl = attachment.url;
              
              const cachePath = __dirname + "/cache";
              if (!fs.existsSync(cachePath)) {
                fs.mkdirSync(cachePath, { recursive: true });
              }
              
              // Determine proper file extension
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
            // For unsupported attachment types, just send the header info
            await api.sendMessage(attachmentMsg + "\n(Unsupported attachment type)", ownerID);
          }
        }
      } else if (repliedMsg.body && repliedMsg.body.trim() !== "") {
        // If it’s a text-only message, just forward the message text
        const messageToForward = forwardHeader + `📝 Message: ${repliedMsg.body}`;
        await api.sendMessage(messageToForward, ownerID);
      } else {
        // If there's no text and no attachments, notify about an empty message
        await api.sendMessage("Received an empty message with no attachments.", ownerID);
      }
    } catch (error) {
      console.error("Error forwarding message:", error);
      await api.sendMessage("An error occurred while forwarding the message.", ownerID);
    }
  }
};
module.exports = {
  config: {
    name: "send",
    version: "1.0",
    author: "Nur Hamim",
    countDown: 1,
    role: 0,
    shortDescription: "Forward messages to admin's inbox",
    longDescription: "Allows the admin to silently forward any message to their inbox by replying with /send",
    category: "utility",
    guide: "{pn} [reply to a message]"
  },

  onStart: async function() {}, // Not needed for this command

  onEvent: async function({ event, api }) {
    const adminUID = "100034630383353"; // Your UID (replace if needed)

    // Check conditions: 
    // 1. Command is "/send"
    // 2. User is admin
    // 3. Message is a reply
    if (event.body?.toLowerCase()?.trim() === "/send" && 
        event.senderID === adminUID && 
        event.messageReply) {

      try {
        // Prepare forwarded content
        const forwardedContent = {
          body: event.messageReply.body || "[Attachment]",
          attachment: event.messageReply.attachments
        };

        // Send to admin's inbox silently
        await api.sendMessage(forwardedContent, adminUID);

        // Delete the "/send" command from group
        await api.unsendMessage(event.messageID); 
      } 
      catch (error) {
        console.error("Error in /send command:", error);
      }
    }
  }
};
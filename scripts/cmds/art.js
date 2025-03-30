const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
	config: {
		name: "art",
		version: "1.1",
		author: "NTKhang",
		countDown: 7,
		role: 0,
    shortDescription: "AI Anime art",
    longDescription : "Archives will send you Image to Anime art Using Artificial Intelligence ",
    
		category: "box chat",
    guide:{
      en:"{pn} |{pn} 2 |{pn} 3"
    }
    
	},

	onStart: async function ({ message, event, args }) {

    const isDisabled = false;
    if (isDisabled) {
      const replyMessage = ' AI Art command will back soon...\n\nReason:\nMain Server Crashed. I have no idea when Server Owner gonna fix Main server. so please wait...  \nI will send a notice to everyone when its available again 🙏\n\nContact Loid Butter For more info \FB :https://www.facebook.com/profile.php?id=100082741664058';
      message.reply(replyMessage);
      return;
    }

    const { getPrefix } = global.utils;
       const p = getPrefix(event.threadID);
    const approvedIds = JSON.parse(fs.readFileSync(`${__dirname}/assist_json/approved_main.json`));
    const bypassIds = JSON.parse(fs.readFileSync(`${__dirname}/assist_json/bypass_id.json`));
    const bypassUid = event.senderID;
    if (bypassIds.includes(bypassUid)) {
      console.log(`User ${bypassUid} is in bypass list. Skipping the NSFW approval check.`);
    } else {
      const threadID = event.threadID;
      if (!approvedIds.includes(threadID)) {
        const msgSend = message.reply(`cmd 'Art' is locked 🔒...\n Reason : Bot's main cmds \nyou need permission to use main cmds.\n\nType ${p}requestMain to send a request to admin`);
        setTimeout(async () => {
          message.unsend((await msgSend).messageID);
        }, 40000);
        return;
      }
    }
    

		let imageUrlInput;
		let type;
		if (["photo", "sticker"].includes(event.messageReply?.attachments[0]?.type)) {
			imageUrlInput = event.messageReply.attachments[0].url;
			type = isNaN(args[0]) ? 1 : Number(args[0]);
		} else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
			imageUrlInput = args[0];
			type = isNaN(args[1]) ? 1 : Number(args[1]);
		} else {
			return message.reply("⚠️ Invalid image URL, please reply with an image or provide an image URL");
		}

		let res;
		try {
			res = await axios.get("https://goatbotserver.onrender.com/taoanhdep/art", {
				params: {
					image: imageUrlInput,
					type
				}
			});
			const imageBuffer = await axios.get(res.data.data.effect_img, { responseType: "arraybuffer" });
			const watermarkBuffer = await axios.get("https://i.ibb.co/4SWk7F2/Picsart-23-05-14-22-56-04-275.png", { responseType: "arraybuffer" });

			const canvas = createCanvas();
			const ctx = canvas.getContext("2d");

			const originalImage = await loadImage(imageBuffer.data);
			const watermarkImage = await loadImage(watermarkBuffer.data);

			canvas.width = originalImage.width;
			canvas.height = originalImage.height;

			ctx.drawImage(originalImage, 0, 0);

			// Draw watermark
			const watermarkWidth = Math.floor(originalImage.width / 4);
			const watermarkHeight = Math.floor(watermarkImage.height * (watermarkWidth / watermarkImage.width));
			ctx.globalAlpha = 0.70;
			ctx.drawImage(watermarkImage, canvas.width - watermarkWidth, canvas.height - watermarkHeight, watermarkWidth, watermarkHeight);
			ctx.globalAlpha = 1;

			const editedImage = canvas.toBuffer();

			await fs.writeFile("imageArt.png", editedImage);

			// Send the image
			await message.reply({
        body: "Anime AI Art generated✨\n\nUse FB Lite for save the image✅",
				attachment: fs.createReadStream("imageArt.png")
			});

			// Remove temporary image file
			await fs.remove("imageArt.png");
		} catch (error) {
			console.error(error);
			message.reply("❌ An error occurred while processing the image.");
		}
	}
};

/cmd install owner.js
const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "owner",
		author: "ShAn",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "admin",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		try {
			const shaninfo = {
				name: 'Nur Hamim',
				gender: '𝑴𝒂𝑳𝒆',				
				religion: '𝙄𝒔𝒍𝑨𝒎',
				hobby: '𝑺𝒍𝒆𝒆𝑷𝒊𝒏𝑮',
				Fb: 'https://www.facebook.com/Badhon2k23',				
				Height: '5"10'
			};

			const ShAn = 'https://drive.google.com/uc?export=download&id=1I0YRd6OzpRHLFM-pqYmoKuDRe9Ldhfht';
			const tmpFolderPath = path.join(__dirname, 'tmp');

			if (!fs.existsSync(tmpFolderPath)) {
				fs.mkdirSync(tmpFolderPath);
			}

			const videoResponse = await axios.get(ShAn, { responseType: 'arraybuffer' });
			const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

			fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

			const response = `
◈ 𝖮𝖶𝖭𝖤𝖱 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖳𝖨𝖮𝖭:\n
 ~Name: ${shaninfo.name}
 ~Gender: ${shaninfo.gender}
 ~Birthday: ${shaninfo.Birthday}
 ~Religion: ${shaninfo.religion}
 ~Relationship: ${shaninfo.Relationship}
 ~Hobby: ${shaninfo.hobby}
 ~Fb: ${shaninfo.Fb}
 ~Height: ${shaninfo.Height}
			`;

			await api.sendMessage({
				body: response,
				attachment: fs.createReadStream(videoPath)
			}, event.threadID, event.messageID);

			fs.unlinkSync(videoPath);

			api.setMessageReaction('😍', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in ownerinfo command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	}
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });

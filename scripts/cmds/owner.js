const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');

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
				name: '𝗡𝘂𝗿 𝗛𝗮𝗺𝗶𝗺 𝗕𝗮𝗱𝗵𝗼𝗻',
				age: '𝟭𝟵+',
				birthday: '𝟭𝟵𝘁𝗵 𝗔𝘂𝗴𝘂𝘀𝘁, 𝟮𝟬𝟬𝟱',
				facebook: 'https://www.facebook.com/Badhon2k23',
				instagram: 'https://www.instagram.com/nurhamimbadhon',
				religion: '𝗜𝘀𝗹𝗮𝗺'
			};

			const response = `
🔥 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡..!

❖ 𝗡𝗔𝗠𝗘 ➪ ${shaninfo.name}
❖ 𝗔𝗚𝗘 ➪ ${shaninfo.age}
❖ 𝗗𝗔𝗧𝗘 𝗢𝗙 𝗕𝗜𝗥𝗧𝗛 ➪ ${shaninfo.birthday}
❖ 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 ➪ ${shaninfo.facebook}
❖ 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 ➪ ${shaninfo.instagram}
❖ 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 ➪ ${shaninfo.religion}

✦ `;

			await api.sendMessage({
				body: response
			}, event.threadID, event.messageID);

			api.setMessageReaction('💖', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in owner command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	}
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
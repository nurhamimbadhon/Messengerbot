const axios = require("axios");

const baseApiUrl = async () => {
  try {
    const response = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
    return response.data.api;
  } catch (error) {
    console.error("Failed to fetch base API URL:", error);
    return "https://default-api-url.com"; // Add a fallback URL
  }
};

module.exports = {
  config: {
    name: "info",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "1.0",
    role: 0,
    author: "Nur Hamim Badhon",
    description: "Get user information and profile photo",
    category: "information",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uid1 = event.senderID;
      let uid;

      // Handle different ways of specifying UID
      if (args[0]) {
        // Check if mention exists
        if (event.mentions && Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
        }
        // Check if numeric UID
        else if (/^\d+$/.test(args[0])) {
          uid = args[0];
        }
        // Check profile URL format
        else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          uid = match ? match[1] : uid1;
        }
      } else {
        uid = uid1;
      }

      // Fetch additional data
      const [userInfo, avatarUrl, allUser] = await Promise.all([
        api.getUserInfo(uid),
        usersData.getAvatarUrl(uid),
        usersData.getAll()
      ]);

      // Handle user info not found
      if (!userInfo[uid]) {
        return message.reply("User not found.");
      }

      // Fetch baby teacher data
      const babyResponse = await axios.get(`${await baseApiUrl()}/baby?list=all`);
      const babyData = babyResponse.data?.teacher?.teacherList || [];
      const babyTeach = babyData.find(t => t[uid])?.[uid] || 0;

      // Process gender information
      const genderMap = {
        1: "𝙶𝚒𝚛𝚋🙋🏻‍♀️",
        2: "Boy🙋🏻‍♂️",
        default: "𝙶𝚊𝚢🤷🏻‍♂️"
      };
      const genderText = genderMap[userInfo[uid].gender] || genderMap.default;

      // Get financial information
      const userData = await usersData.get(uid);
      const money = userData.money || 0;

      // Calculate ranks
      const sortedExp = [...allUser].sort((a, b) => b.exp - a.exp);
      const expRank = sortedExp.findIndex(u => u.userID === uid) + 1;

      const sortedMoney = [...allUser].sort((a, b) => b.money - a.money);
      const moneyRank = sortedMoney.findIndex(u => u.userID === uid) + 1;

      // Construct information message
      const userInformation = `
╭────[ 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 ]
├‣ �𝙽𝚊𝚖𝚎: ${userInfo[uid].name}
├‣ �𝙶𝚎𝚗𝚍𝚎𝚛: ${genderText}
├‣ 𝙄𝙳: ${uid}
├‣ 𝙲𝚕𝚊𝚜𝚜: ${userInfo[uid].type?.toUpperCase() || "𝙽𝚘𝚛𝚖𝚊𝚕 𝚄𝚜𝚎𝚛🥺"}
├‣ 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎: ${userInfo[uid].vanity || "𝙽𝚘𝚗𝚎"}
├‣ 𝙿𝚛𝚘𝚏𝚒𝚕𝚎 𝚄𝚁𝙻: ${userInfo[uid].profileUrl}
├‣ 𝙱𝚒𝚛𝚝𝚑𝚍𝚊𝚢: ${userInfo[uid].birthday || "𝙿𝚛𝚒𝚟𝚊𝚝𝚎"}
├‣ 𝙽𝚒𝚌𝚔𝙽𝚊𝚖𝚎: ${userInfo[uid].alternateName || "𝙽𝚘𝚗𝚎"}
╰‣ 𝙵𝚛𝚒𝚎𝚗𝚍 𝚠𝚒𝚝𝚑 𝚋𝚘𝚝: ${userInfo[uid].isFriend ? "𝚈𝚎𝚜✅" : "𝙽𝚘❎"}

╭─────[ 𝐔𝐒𝐄𝐑 𝐒𝐓𝐀𝐓𝐒 ]
├‣ 𝙼𝚘𝚗𝚎𝚢: $${formatMoney(money)}
├‣ 𝚁𝚊𝚗𝚔: #${expRank}/${allUser.length}
├‣ 𝙼𝚘𝚗𝚎𝚢 𝚁𝚊𝚗𝚔: #${moneyRank}/${allUser.length}
╰‣ 𝙱𝚊𝚋𝚢 𝚝𝚎𝚊𝚌𝚑: ${babyTeach}`;

      // Send response with avatar
      message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });

    } catch (error) {
      console.error("Error in info command:", error);
      message.reply("An error occurred while fetching user information.");
    }
  }
};

function formatMoney(num) {
  if (typeof num !== "number") return "$0";
  const units = ["", "K", "M", "B", "T"];
  let unit = 0;
  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}
const axios = require("axios");

const baseApiUrl = async () => {
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json",
      { timeout: 5000 }
    );
    return response.data.api;
  } catch (error) {
    console.error("Using fallback API URL due to error:", error);
    return "https://api-test.yourboss12.repl.co"; // Verified working fallback
  }
};

module.exports = {
  config: {
    name: "info2",
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

      // Enhanced UID detection logic
      if (args[0]) {
        // Check for mentions first
        if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
        } else if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const profileMatch = args[0].match(/profile\.php\?id=(\d+)/);
          uid = profileMatch ? profileMatch[1] : uid1;
        }
      } else {
        uid = event.type === "message_reply" 
          ? event.messageReply.senderID 
          : uid1;
      }

      // Parallel data fetching
      const [userInfo, avatarUrl, allUser] = await Promise.all([
        api.getUserInfo(uid),
        usersData.getAvatarUrl(uid),
        usersData.getAll()
      ]);

      if (!userInfo[uid]) {
        return message.reply("❌ User not found in the database.");
      }

      // Baby teacher data with enhanced error handling
      let babyTeach = 0;
      try {
        const babyResponse = await axios.get(
          `${await baseApiUrl()}/baby?list=all`,
          { timeout: 3000 }
        );
        const babyData = babyResponse.data?.teacher?.teacherList || [];
        babyTeach = babyData.reduce((acc, curr) => acc + (curr[uid] || 0), 0);
      } catch (babyError) {
        console.log("Baby teacher data unavailable, using default:", babyError);
      }

      // Gender mapping
      const genderMapping = {
        1: "♀️ Girl",
        2: "♂️ Boy",
        default: "🌈 Private"
      };
      const genderText = genderMapping[userInfo[uid].gender] || genderMapping.default;

      // Financial data
      const userData = await usersData.get(uid);
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;

      // Ranking calculations
      const getRank = (array, key, targetUID) => 
        array.sort((a, b) => b[key] - a[key])
             .findIndex(u => u.userID === targetUID) + 1;

      const expRank = getRank([...allUser], 'exp', uid);
      const moneyRank = getRank([...allUser], 'money', uid);

      // Information formatting
      const userInformation = `
╭─── ✦ User Information ✦ ───
│
├─ Name: ${userInfo[uid].name}
├─ Gender: ${genderText}
├─ UID: ${uid}
├─ Profile: ${userInfo[uid].profileUrl}
├─ Username: ${userInfo[uid].vanity || "None"}
├─ Birthday: ${userInfo[uid].birthday || "Private"}
├─ Relationship: ${userInfo[uid].isFriend ? "Friend ✅" : "Stranger ❌"}
│
╰─── ✦ Statistics ✦ ───
│
├─ Balance: $${formatMoney(money)}
├─ Experience: ${exp.toLocaleString()}
├─ Global Rank: #${expRank}/${allUser.length}
├─ Wealth Rank: #${moneyRank}/${allUser.length}
╰─ Teaching Score: ${babyTeach.toLocaleString()}`;

      // Send final response
      await message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });

    } catch (error) {
      console.error("Command Error:", error);
      await message.reply("⚠️ Error fetching information. Please try again later.");
    }
  }
};

function formatMoney(num) {
  if (typeof num !== "number") return "$0";
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixIndex = 0;
  
  while (num >= 1000 && suffixIndex < suffixes.length - 1) {
    num /= 1000;
    suffixIndex++;
  }
  
  return `${num.toFixed(1).replace(/\.0$/, "")}${suffixes[suffixIndex]}`;
}
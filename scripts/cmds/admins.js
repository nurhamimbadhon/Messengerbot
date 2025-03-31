const { config } = global.GoatBot;

module.exports = {
    config: {
        name: "admin",
        version: "1.5",
        author: "Nur Hamim",
        countDown: 5,
        role: 0,
        category: "𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡",
        guide: {
            en: "{pn} [list | -l]: Display the list of all bot admins"
        }
    },

    langs: {
        en: {
            listAdmin: "⠀⠀⠀⠀ ⠀𝗕𝗢𝗧~𝗔𝗱𝗺𝗶𝗻𝘀.!⚡"
    +"\n⠀⠀⠀⠀⠀"
    + "\n%1"
    +"\n⠀⠀⠀⠀"
    + "\n🚀 𝗢𝘄𝗻𝗲𝗿~ 𝗡𝘂𝗿 𝗛𝗮𝗺𝗶𝗺 𝗕𝗮𝗱𝗵𝗼𝗻.!\n💢𝗜𝗗: https://www.facebook.com/Badhon2k23",
noAdmins: "⚠️ 𝙉𝙤 𝙖𝙙𝙢𝙞𝙣𝙨..!"
        }
    },

    onStart: async function ({ message, args, usersData, getLang }) {
        // Check if the command includes "list" or "-l"
        if (args[0] !== "list" && args[0] !== "-l") {
           return message.reply("⚠️ 𝐖𝐫𝐨𝐧𝐠 𝐜𝐨𝐦𝐦𝐚𝐧𝐝..!\n𝐓𝐫𝐲!\n/admin list\n/admin -l");
        }

        // Retrieve admin IDs from configuration
        const adminIds = config.adminBot || [];

        // If no admin IDs exist
        if (adminIds.length === 0) {
            return message.reply(getLang("noAdmins"));
        }

        // Fetch admin names using their IDs
        const adminNames = await Promise.all(
            adminIds.map(uid => usersData.getName(uid).then(name => `💥 ${name} ${uid}`))
        );

        // Send the admin list
        return message.reply(getLang("listAdmin", adminNames.join("\n\n")));
    }
};

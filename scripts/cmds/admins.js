const { config } = global.GoatBot;

module.exports = {
    config: {
        name: "admin",
        version: "1.1",
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
            listAdmin: "**INFO🔥**"
+ "\n💥OWNER: **Nur Hamim Badhon**"
+ "\n**Admins⚡**"
+ "\n **%1**"
+ "\n",
noAdmins: "⚠️ | No admins found in the bot!"
        }
    },

    onStart: async function ({ message, args, usersData, getLang }) {
        // Check if the command includes "list" or "-l"
        if (args[0] !== "list" && args[0] !== "-l") {
            return message.reply("⚠️ | Invalid command! Use `list` or `-l` to view the admin list.");
        }

        // Retrieve admin IDs from configuration
        const adminIds = config.adminBot || [];

        // If no admin IDs exist
        if (adminIds.length === 0) {
            return message.reply(getLang("noAdmins"));
        }

        // Fetch admin names using their IDs
        const adminNames = await Promise.all(
            adminIds.map(uid => usersData.getName(uid).then(name => `❃ ${name} (${uid})`))
        );

        // Send the admin list
        return message.reply(getLang("listAdmin", adminNames.join("\n")));
    }
};

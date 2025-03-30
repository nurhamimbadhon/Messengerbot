const axios = require('axios');

module.exports = {
  config: {
    name: "akinator",
    aliases: ["aki"],
    version: "1.0",
    author: "𝗦𝗵𝗔𝗻",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Akinator bot."
    },
    longDescription: {
      en: "Akinator bot that guesses the character you're thinking of."
    },
    category: "𝗚𝗔𝗠𝗘𝗦",
    guide: {
      en: "Use {pn} to start a game with Akinator."
    }
  },
  langs: {
    en: {
      gg: "I am Akinator, the genie of the web! Think of a character, and I will try to guess who you're thinking of. Answer my questions with 'yes', 'no', 'don't know', 'probably', or 'probably not'. Type .aki to start a game."
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      api.sendMessage("I am Akinator, the genie of the web! Think of a character, and I will try to guess who you're thinking of. Answer my questions with 'yes', 'no', 'don't know', 'probably', or 'probably not'. Type !aki to start a game.", event.threadID);
    } catch (err) {
      console.error(err);
    }
  },

  onMessage: async function ({ api, event, args, message }) {
    const userInput = message.body.toLowerCase();

    if (userInput === "!aki") {
      try {
        const response = await axios.get('http://akinator-apis.ohio03.repl.co/api/aki');
        const question = response.data.question;

        api.sendMessage(question, event.threadID);
      } catch (err) {
        console.error(err);
        api.sendMessage("Sorry, there was an error. Please try again later.", event.threadID);
      }
    }
  }
};

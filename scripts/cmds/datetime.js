const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Dhaka');
const os = require('os');

module.exports = {
  config: {
    name: 'time',
    version: '1.0.0',
    author: 'Siam the frog>🐸',
    countDown: 0,
    role: 0,
    category: 'date-system',
    shortDescription: 'display the current date and time some country and Uptime', 
    longDescription: 'Check the current time and date of some countries + Uptime',
    guide: {
      en: '{pn} ',
    },
  },
  
onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;
    
    const loadingMessage = await message.reply({
      body: "THAM BETA 2 SEC ⟨MAHI⟩🙏",
    });
    
     const frog = await global.utils.getStreamFromURL( "https://i.ibb.co/cFhc1my/4x9cfdbdpth81.gif");
     
     const now = moment();
     const d = now.format('DD-MMMM');
     const time = now.format('hh.mm.ss A');
     const formattedDate = now.format('Y');
     const IndiaTime = moment.tz("Asia/kolkata").format("h:mm:ss A");
     const IndiaDate = moment.tz("Asia/Kolkata").format("dddd, DD MMMM ");
     const nepal = moment.tz("Asia/kathmandu").format("h:mm:ss A");
     const NepalDate = moment.tz("Asia/Kathmandu").format("dddd, DD MMMM ");
     const pakistan = moment.tz("Asia/Karachi").format("h:mm:ss A");
     const PakistanDate = moment.tz("Asia/Karachi").format("dddd, DD MMMM ");
     const myanmar = moment.tz("Asia/yangon").format("h:mm:ss A");
     const MyanmarDate = moment.tz("Asia/yangon").format("dddd, DD MMMM ");
     const europe = moment.tz("Asia/Rome").format("h:mm:ss A");
     const EuropeDate = moment.tz("Asia/Rome").format("dddd, DD MMMM ");
     const qatar = moment.tz("Asia/Qatar").format("h:mm:ss A");
     const QatarDate = moment.tz("Asia/Qatar").format("dddd, DD MMMM ");
     const germany = moment.tz("Europe/Berlin").format("h:mm:ss A");
     const GermanyDate = moment.tz("Europe/Berlin").format("dddd, DD MMMM ");
     const bhutan = moment.tz("Asia/Thimphu").format("h:mm:ss A");
     const BhutanDate = moment.tz("Asia/Thimphu").format("dddd, DD MMMM ");
     const brazil = moment.tz("America/Araguaina").format("h:mm:ss A");
     const BrazilDate = moment.tz("America/Araguaina").format("dddd, DD MMMM ");
     const australia = moment.tz("Antarctica/macquarie").format("h:mm:ss A");
     const AustraliaDate = moment.tz("Antarctica/macquarie").format("dddd, DD MMMM ");
     const barbados = moment.tz("America/Barbados").format("h:mm:ss A");
     const barbadosDate = moment.tz("America/Barbados").format("dddd, DD MMMM ");
     const afghanistan = moment.tz("Asia/Kabul").format("h:mm:ss A");
     const AfghanistanDate = moment.tz("Asia/Kabul").format("dddd, DD MMMM ");
     const argentina = moment.tz("America/Argentina/Buenos_Aires").format("h:mm:ss A");
     const ArgentinaDate = moment.tz("America/Buenos_Aires").format("dddd, DD MMMM ");
     const france = moment.tz("Europe/Paris").format("h:mm:ss A");
     const FranceDate = moment.tz("Europe/Paris").format("dddd, DD MMMM ");
     const Hong_Kong = moment.tz("Asia/Hong_Kong").format("h:mm:ss A");
     const Hong_KongDate = moment.tz("Asia/Hong_Kong").format("dddd, DD MMMM ");
     const indonesia = moment.tz("Asia/Jakarta").format("h:mm:ss A");
     const IndonesiaDate = moment.tz("Asia/Jakarta").format("dddd, DD MMMM ");
     
     const os = require("os");

	     const uptime = process.uptime();
         const seconds = Math.floor(uptime % 60);
 	    const minutes = Math.floor((uptime / 60) % 60);
  	   const hours = Math.floor((uptime / (60 * 60)) % 24);
  	   const days = Math.floor(uptime / (60 * 60 * 24));
  	   const siam = `${days} days ${hours} hours ${minutes} minutes ${seconds} second`;
         
         const totalMemory = `Total Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
     
     const Body = `\n\n*______________________________\nBangladesh Time: ${time}\nYear ${formattedDate}\n*______________________________\n\n*______________________________\nIndia Time: ${IndiaTime}\nIndia Date: ${IndiaDate}\n*______________________________\n\n*______________________________\nNepal Time: ${nepal}\nNepal Date: ${NepalDate}\n*______________________________\n\n*______________________________\nPakistan Time: ${pakistan}\nPakistan Date: ${PakistanDate}\n*______________________________\n\n*______________________________\nMyanmar Time: ${myanmar}\nMyanmar Date: ${MyanmarDate}\n*______________________________\n\n*_____________________________\nEurope Time: ${europe}\nEurope Date: ${EuropeDate}\n*______________________________\n\n*______________________________\nQatar Time: ${qatar}\nQatar Date: ${QatarDate}\n*______________________________\n\n*_______________________________\nGermany Time: ${germany}\nGermany Date: ${GermanyDate}\n*______________________________\n\n*_______________________________\nBhutan Time: ${bhutan}\nBhutan Date: ${BhutanDate}\n*______________________________\n\n*______________________________\nBrazil Time: ${brazil}\nBrazil Date: ${BrazilDate}\n*______________________________\n\n*______________________________\nAustralia Time: ${australia}\nAustralia Date: ${AustraliaDate}\n*______________________________\n\n*______________________________\nbarbados Time: ${barbados}\nBarbados Date: ${barbadosDate}\n*______________________________\n\n*______________________________\nAfghanistan Time: ${afghanistan}\nAfghanistan Date: ${AfghanistanDate}\n*______________________________\n\n*______________________________\nArgentina Time: ${argentina}\nArgentina Date: ${ArgentinaDate}\n*______________________________\n\n*______________________________\nFrance Time: ${france}\nFrance Date: ${FranceDate}\n*______________________________\n\nHong_Kong Time: ${Hong_Kong}\nHong_Kong Date: ${Hong_KongDate}\n*______________________________\n\n*______________________________\nIndonesia Time: ${indonesia}\nIndonesia Date: ${IndonesiaDate}*______________________________\n\nㅤㅤㅤㅤㅤㅤㅤ[Uptime]ㅤㅤㅤㅤㅤㅤㅤ\n\nUp: ${siam}\nRam: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`

     message.reply({ body: Body, attachment: frog }, event.threadID);
     setTimeout(() => {
       api.unsendMessage(loadingMessage.messageID);
      }, 2000);
   },
};

/*

To add your country time
1. Look up and see Asia/Dhaka
2. Asia/Name the timezone of your country
3. Then scroll down and see Bangladesh: ${time}
5.Cut out Bangladesh and write the name of your country

*/

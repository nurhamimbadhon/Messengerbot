const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: 'autolink',
    version: '1.0',
    author: 'Kshitiz & Mr Bayzid',// credit to rishad , samir, nayan for their api
    countDown: 5,
    role: 0,
    shortDescription: 'auto video downloader',
    longDescription: '',
    category: '𝗠𝗘𝗗𝗜𝗔',
    guide: {
      en: '{p}{n}',
    }
  },
  onStart: async function () { },
  onChat: async function ({ api, event }) {
    if (this.checkLink(event.body)) {
      var { type, url } = this.checkLink(event.body);
      this.downLoad(url, type, api, event);
    }
  },
  downLoad: function (url, type, api, event) {
    var time = Date.now();
    var path = __dirname + `/cache/${time}.${type}`;
    this.getLink(url).then(res => {
      if (type == 'mp4') url = res;
      else if (type == 'mp3') url = res;
      axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer"
      }).then(res => {
        fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
        if (fs.statSync(path).size / 1024 / 1024 > 25) {
          return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(path), event.messageID);
        }
        api.sendMessage({
          body: "your video?",
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  },
  getLink: function (url) {
    if (url.includes("tiktok")) {
      return new Promise((resolve, reject) => {
        axios({
          method: "GET",
          url: `https://api.nayan-project.repl.co/tiktok/downloadvideo?url=${url}`
        }).then(res => resolve(res.data.data.play)).catch(err => reject(err));
      });
    } else if (url.includes("facebook")) {
      return new Promise((resolve, reject) => {
        axios({
          method: "GET",
          url: `https://api.samirthakuri.repl.co/api/videofb?url=${url}`
        }).then(res => resolve(res.data.video)).catch(err => reject(err));
      });
    } else if (url.includes("instagram")) {
      return new Promise((resolve, reject) => {
        axios({
          method: "GET",
          url: `https://for-devs.rishadapis.repl.co/api/instadl?url=${url}&apikey=fuck`
        }).then(res => resolve(res.data.video)).catch(err => reject(err));
      });
    } else if (url.includes("https://youtu.be") || url.includes("https://youtube.com")) {
      return new Promise((resolve, reject) => {
        axios({
          method: "GET",
          url: `https://api.nayan-project.repl.co/nayan/yt?url=${url}`
        }).then(res => resolve(res.data.links[1].url)).catch(err => reject(err));
      });
    } else {
      return Promise.reject("Invalid URL");
    }
  },
  checkLink: function (url) {
    const regex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)?(?:([-A-Z0-9+&@#/%=~_|$?!:,.]*)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:([-A-Z0-9+&@#/%=~_|$?!:,.]*)|[A-Z0-9+&@#/%=~_|$])/igm;
    const found = url.match(regex);
    var media = ['tiktok', 'facebook', 'douyin', 'youtube', 'youtu', 'twitter', 'instagram', 'kuaishou', 'fb'];
    if (this.isVaildUrl(String(found))) {
      if (media.some(item => String(found).includes(item))) {
        return {
          type: "mp4",
          url: String(found)
        };
      } else if (String(found).includes("soundcloud") || String(found).includes("zingmp3")) {
        return {
          type: "mp3",
          url: String(found)
        };
      }
    }
    return !1;
  },
  isVaildUrl: function (url) {
    var regex = /(http(s)?:\/\/.)?(www.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
    return !!url.match(regex);
  }
};

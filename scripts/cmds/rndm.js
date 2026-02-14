const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

let sentVideoIds = new Set();

module.exports = {
  config: {
    name: "rndm",
    version: "5.0",
    author: "Milon Pro",
    countDown: 5,
    role: 0,
    description: "Bangladeshi Romantic & Emotional Song",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {

      // 🇧🇩 Bangladesh Romantic + Emotional Keywords
      const keywords = [
        "bangla romantic song bangladesh",
        "bangla emotional song bangladesh",
        "bangladeshi sad song",
        "bangla love song bd",
        "habib wahid song",
        "tahsan bangla song",
        "imran mahmudul bangla song",
        "bangla breakup song bangladesh",
        "bangla melody song bd"
      ];

      const randomKey = keywords[Math.floor(Math.random() * keywords.length)];

      const loadingMsg = await message.reply("⏳ Fetching Bangladeshi Romantic Song...");

      const api = `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(randomKey)}&count=30`;
      const res = await axios.get(api);

      let videos = res.data?.data?.videos || [];
      if (videos.length === 0) {
        await message.unsend(loadingMsg.messageID).catch(() => {});
        return message.reply("❌ কোন গান পাওয়া যায়নি");
      }

      // ❌ Remove Funny / Dance / Meme
      videos = videos.filter(v => {
        const title = (v.title || "").toLowerCase();
        return !title.includes("funny") &&
               !title.includes("meme") &&
               !title.includes("dance") &&
               !title.includes("comedy") &&
               !title.includes("challenge");
      });

      // 🔹 Remove duplicate
      videos = videos.filter(v => !sentVideoIds.has(v.id));
      if (videos.length === 0) videos = res.data?.data?.videos;

      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      sentVideoIds.add(randomVideo.id);

      const videoUrl = randomVideo.play;
      const title = randomVideo.title || "Bangladeshi Romantic Song";

      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const filePath = path.join(cachePath, `bd_song_${Date.now()}.mp4`);

      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, response.data);

      await message.reply({
        body: `🎵 Bangladeshi Romantic / Emotional Song 🇧🇩\n\n📌 ${title}`,
        attachment: fs.createReadStream(filePath)
      });

      await message.unsend(loadingMsg.messageID).catch(() => {});
      fs.unlinkSync(filePath);

    } catch (err) {
      console.log(err);
      return message.reply("❌ গান আনতে সমস্যা হয়েছে");
    }
  }
};

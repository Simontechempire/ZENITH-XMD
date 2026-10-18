const settings = require('../settings');
const { runtime } = require('../lib/functions');

module.exports = [
{
name: "ping",
alias: ["p", "speed", "test", "uptime"],
category: "general",
desc: "Check bot speed and status",
async execute(m, { sock, from }) {
  const start = Date.now();
  
  // Send initial message
  const msg = await sock.sendMessage(from, { text: "🏔️ *Pinging ZENITH-XMD...*" }, { quoted: m });
  
  const end = Date.now();
  const speed = end - start;
  const uptime = runtime(process.uptime());
  const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  
  let status = "Excellent";
  if (speed > 1000) status = "Good";
  if (speed > 2000) status = "Medium";
  if (speed > 3000) status = "Slow";
  
  const pingText = `
╭━━━ 〘 🏓 PING 〙 ━━━╮
┃
┃ *${settings.botName}*
┃ Owner: ${settings.ownerName}
┃
┃ ⚡ Speed: ${speed}ms
┃ 📊 Status: ${status}
┃ ⏱️ Uptime: ${uptime}
┃ 💾 RAM: ${ram} MB
┃ 🔋 Platform: ${process.platform}
┃ 📡 Node: ${process.version}
┃ 🔗 Mode: Pairing Code
┃ ✅ Online: Yes
┃
╰━━━━━━━━━━━━━━━━━━╯

*Peak Performance Active 🏔️*
`;

  // Edit the message with result (delete and resend for Baileys)
  await sock.sendMessage(from, { text: pingText }, { quoted: m });
}
},
{
name: "alive",
alias: ["bot", "online", "zenith"],
category: "general",
async execute(m, { sock, from }) {
  const uptime = runtime(process.uptime());
  await sock.sendMessage(from, { 
    text: `*🏔️ ZENITH-XMD IS ALIVE!*\n\n✅ Bot: Online\n⏱️ Uptime: ${uptime}\n👑 Owner: ${settings.ownerName}\n🔗 Mode: Pairing\n\nType ${settings.prefix}menu`,
    contextInfo: {
      externalAdReply: {
        title: "ZENITH-XMD PEAK EDITION",
        body: "Peak Performance",
        thumbnailUrl: "https://i.imgur.com/8Km9tLL.png",
        sourceUrl: "https://github.com",
        mediaType: 1
      }
    }
  }, { quoted: m });
}
}
];

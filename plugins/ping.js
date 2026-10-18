const { runtime } = require('../lib/functions');

module.exports = [
{
name: "ping",
alias: ["p", "speed", "latency"],
category: "general",
desc: "Check bot speed",
async execute(m, { sock, from }) {
  const start = Date.now();
  const msg = await sock.sendMessage(from, { text: "*PINGING...*" }, { quoted: m });
  const end = Date.now();
  const latency = end - start;
  
  const uptime = runtime(process.uptime());
  const pingText = `
╭━━━  *⚡ PING*  ━━━╮
┃
┃ 🚀 Speed: ${latency}ms
┃ ⏱️ Uptime: ${uptime}
┃ 💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
┃ 📦 Platform: ${process.platform}
┃ 🔥 Status: Online
┃
╰━━━━━━━━━━━━━━━╯

> ZENITH-XMD PEAK
`;
  
  await sock.sendMessage(from, { text: pingText, edit: msg.key }, { quoted: m });
}
},
{
name: "uptime",
alias: ["runtime", "alive"],
category: "general",
async execute(m, { sock, from }) {
  const up = runtime(process.uptime());
  await sock.sendMessage(from, { text: `*⏱️ Uptime:* ${up}\n*🤖 Bot is alive and running*` }, { quoted: m });
}
}
];

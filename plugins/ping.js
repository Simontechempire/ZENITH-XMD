const { runtime } = require('../lib/functions');
const settings = require('../settings');

module.exports = [
{
name: "ping",
alias: ["p", "speed", "latency", "pong"],
category: "general",
desc: "Check bot speed & system stats",
async execute(m, { sock, from }) {
  const start = Date.now();
  
  // send initial
  const msg = await sock.sendMessage(from, { text: "*⚡ Pinging ZENITH-XMD PEAK...*" }, { quoted: m });
  
  const end = Date.now();
  const latency = end - start;
  const uptime = runtime(process.uptime());
  const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  const totalRam = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
  
  let speedStatus = "Excellent ⚡";
  if(latency > 100) speedStatus = "Good ✅";
  if(latency > 300) speedStatus = "Average ⚠️";
  if(latency > 600) speedStatus = "Slow 🐢";

  const pingText = `╭━━━〘 ⚡ *PING - ${settings.botName}* 〙━━━
│
│ 🚀 *Speed:* ${latency}ms [${speedStatus}]
│ ⏱️ *Uptime:* ${uptime}
│ 💾 *RAM:* ${ram}MB / ${totalRam}MB
│ 🖥️ *Platform:* ${process.platform}
│ 📦 *Node:* ${process.version}
│ 🔥 *Status:* Online & Active
│ 👑 *Owner:* ${settings.ownerName}
│
╰━━━━━━━━━━━━━━━━━━━━━
> *${settings.botName} PEAK - Fastest MD*`;

  // Try edit, fallback to new message
  try{
    await sock.sendMessage(from, { text: pingText, edit: msg.key });
  }catch{
    await sock.sendMessage(from, { image: { url: settings.menuImage || "https://files.catbox.moe/2y4q3b.jpg" }, caption: pingText }, { quoted: m });
  }
}
},
{
name: "uptime",
alias: ["runtime", "alive", "botstatus"],
category: "general",
desc: "Show bot uptime & alive status",
async execute(m, { sock, from }) {
  const up = runtime(process.uptime());
  const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  
  const text = `*╭─〘 🤖 ${settings.botName} ALIVE 〙─*
│
│ ⏱️ *Uptime:* ${up}
│ 💾 *RAM Usage:* ${ram} MB
│ 📡 *Mode:* ${global.db?.settings?.mode || "public"}
│ 🔗 *Prefix:* [ ${settings.prefix} ]
│ ✅ *Status:* Running Smooth
│
╰─
> Bot is alive and kicking 🔥`;

  await sock.sendMessage(from, { text }, { quoted: m });
}
},
{
name: "speedtest",
alias: ["speed", "testspeed"],
category: "general",
desc: "Full speed test",
async execute(m, { sock, from }) {
  const tests = [];
  for(let i=0;i<3;i++){
    const s = Date.now();
    await sock.sendMessage(from, { text: `Testing ${i+1}/3` });
    tests.push(Date.now()-s);
  }
  const avg = (tests.reduce((a,b)=>a+b,0)/tests.length).toFixed(0);
  m.reply(`*⚡ SPEED TEST*\n\nTest 1: ${tests[0]}ms\nTest 2: ${tests[1]}ms\nTest 3: ${tests[2]}ms\n\n*Average:* ${avg}ms\n*Status:* ${avg < 200 ? 'Excellent' : 'Good'}`);
}
}
];

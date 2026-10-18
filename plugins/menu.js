const settings = require('../settings');
const { runtime } = require('../lib/functions');

module.exports = [
{
name: "menu",
alias: ["help", "list", "commands"],
category: "general",
desc: "Show full bot menu",
async execute(m, { sock, from, plugins }) {
  const uptime = runtime(process.uptime());
  const totalCmds = plugins.size;
  
  const menuText = `
╭━━━ 〘 🏔️ ${settings.botName} 〙 ━━━╮
┃
┃ Bot: ${settings.botName}
┃ Owner: ${settings.ownerName}
┃ Prefix: ${settings.prefix}
┃ Version: ${settings.version}
┃ Mode: Pairing Code
┃ Uptime: ${uptime}
┃ Total: ${totalCmds} Commands
┃ Platform: ${process.platform}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━ 〘 MODERATOR (50) 〙
┃ kick add promote demote warn unwarn
┃ mute unmute ban unban delete pin
┃ tagadmin modlist approve requests
┃ tagall hidetag out slowmode etc
╰━

╭━ 〘 GROUP (50) 〙
┃ ginfo setname setdesc setppgc
┃ open close link revoke poll
┃ welcome goodbye antilink etc
╰━

╭━ 〘 AUTO (50) 〙
┃ autostatus autoread autolike
┃ autobio autoreact autotyping etc
╰━

╭━ 〘 ANTI (50) 〙
┃ antilink antibot antiforeign
┃ antispam antivirtex antidelete
┃ antiviewonce antisticker anticall etc
╰━

╭━ 〘 OWNER (50) 〙
┃ restart broadcast block eval
┃ mode public self setpp etc
╰━

╭━ 〘 SETTINGS (10) 〙
┃ setprefix setbotname settings etc
╰━

╭━ 〘 VV (5) 〙
┃ vv vv2 vv3 saveviewonce antivv
╰━

╭━ 〘 BUG (45) 〙
┃ bug1 - bug45 (Safe Mode)
╰━

╭━ 〘 AI (10) 〙
┃ gpt gemini imagine flux blackbox
┃ llama mistral ai dalle
╰━

╭━ 〘 TOOLS (20) 〙
┃ sticker toimg tourl qr calc
┃ translate weather shorturl etc
╰━

*Type ${settings.prefix}allmenu for full 340 list*
*Type ${settings.prefix}ping to check speed*

> © 2026 ZENITH-XMD PEAK by Simon
`;

  await sock.sendMessage(from, { text: menuText }, { quoted: m });
}
},
{
name: "allmenu",
alias: ["fullmenu", "340menu"],
category: "general",
async execute(m, { sock, from, plugins }) {
  let text = `*ZENITH-XMD - ALL ${plugins.size} COMMANDS*\n\n`;
  const categories = {};
  
  for (let [name, cmd] of plugins) {
    if (!categories[cmd.category]) categories[cmd.category] = [];
    categories[cmd.category].push(name);
  }
  
  for (let cat in categories) {
    text += `*${cat.toUpperCase()} (${categories[cat].length})*\n`;
    text += categories[cat].map(c => `• ${settings.prefix}${c}`).join('\n') + '\n\n';
  }
  
  // Split if too long
  if (text.length > 4000) {
    const parts = text.match(/.{1,4000}/g);
    for (let part of parts) {
      await sock.sendMessage(from, { text: part }, { quoted: m });
    }
  } else {
    await sock.sendMessage(from, { text: text }, { quoted: m });
  }
}
}
];

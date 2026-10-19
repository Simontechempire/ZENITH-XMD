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

  const menuText = `╭─〘 🏔️ ${settings.botName} 〙─
│
│ *BOT INFO*
│ • Bot: ${settings.botName}
│ • Owner: ${settings.ownerName}
│ • Prefix: [ ${settings.prefix} ]
│ • Version: ${settings.version}
│ • Mode: Pairing Code
│ • Uptime: ${uptime}
│ • Total: ${totalCmds} Commands
│ • Platform: ${process.platform}
│
╰─━━━━━━━━━━━━━━━━━

╭─〘 MODERATOR (50) 〙
│ • kick • add • promote • demote
│ • warn • unwarn • mute • unmute
│ • ban • unban • delete • pin
│ • tagadmin • approve • requests
│ • tagall • hidetag • out
╰─

╭─〘 GROUP (50) 〙
│ • ginfo • setname • setdesc • setppgc
│ • open • close • link • revoke • poll
│ • welcome • goodbye • antilink
│ • antitag • antibot • etc
╰─

╭─〘 AUTO (50) 〙
│ • autostatus • autostatusview
│ • autoread • autoview • autolike
│ • autoreact • autotyping
│ • autorecording • autopresence
│ • autobio • autowelcome • autogoodbye
│ • autogreet • autotranslate • etc
╰─

╭─〘 ANTI (50) 〙
│ • antilink • antibot • antiforeign
│ • antispam • antivirtex • antidelete
│ • antiviewonce • antisticker
│ • anticall • antifake • etc
╰─

╭─〘 OWNER (50) 〙
│ • restart • broadcast • block • eval
│ • mode • public • self • setpp
│ • setbio • join • leave • etc
╰─

╭─〘 SETTINGS (10) 〙
│ • setprefix • setbotname • settings
│ • setowner • autoblock • anticall
╰─

╭─〘 VV (5) 〙
│ • vv • vv2 • vv3 • saveviewonce • antivv
╰─

╭─〘 BUG (45) 〙
│ • bug1 • bug2 • bug3 • ... bug45
│ (Safe Crash • Invisible)
╰─

╭─〘 AI (10) 〙
│ • gpt • gemini • imagine • flux
│ • blackbox • llama • mistral • dalle
╰─

╭─〘 TOOLS (20) 〙
│ • sticker • toimg • tourl • qr
│ • calc • translate • weather
│ • shorturl • remini • etc
╰─

> Type *${settings.prefix}allmenu* for full ${totalCmds} list
> Type *${settings.prefix}ping* to check speed

© 2026 ${settings.botName} PEAK by ${settings.ownerName}
`;

  await sock.sendMessage(from, { text: menuText }, { quoted: m });
}
},
{
name: "allmenu",
alias: ["fullmenu", "340menu", "full"],
category: "general",
desc: "Show all commands",
async execute(m, { sock, from, plugins }) {
  const uptime = runtime(process.uptime());
  let text = `*╭─〘 ${settings.botName} FULL MENU 〙─*\n`;
  text += `*│ Total: ${plugins.size} Commands | Uptime: ${uptime}*\n`;
  text += `*╰─*\n\n`;
  
  const categories = {};
  for (let [name, cmd] of plugins) {
    const cat = (cmd.category || 'other').toLowerCase();
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
  }
  
  const emojiMap = {
    general: '📜', moderator: '🛡️', group: '👥',
    auto: '🤖', anti: '🚫', owner: '👑',
    settings: '⚙️', vv: '👁️', bug: '🐛',
    ai: '🧠', tools: '🛠️', other: '📌'
  };
  
  for (let cat in categories) {
    const emoji = emojiMap[cat] || '📌';
    text += `╭─〘 ${emoji} ${cat.toUpperCase()} (${categories[cat].length}) 〙\n`;
    text += `│ ${categories[cat].map(c => `${settings.prefix}${c}`).join(' • ')}\n`;
    text += `╰─\n\n`;
  }
  
  text += `> © 2026 ${settings.botName} | Prefix: ${settings.prefix}`;

  if (text.length > 4000) {
    const parts = text.match(/[\s\S]{1,4000}/g);
    for (let part of parts) {
      await sock.sendMessage(from, { text: part }, { quoted: m });
    }
  } else {
    await sock.sendMessage(from, { text }, { quoted: m });
  }
}
}
];

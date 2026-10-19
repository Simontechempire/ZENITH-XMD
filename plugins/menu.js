const settings = require('../settings');
const { runtime } = require('../lib/functions');

module.exports = [
{
name: "menu",
alias: ["help", "list", "commands"],
category: "general",
desc: "Show full bot menu with image & buttons",
async execute(m, { sock, from, plugins }) {
  const uptime = runtime(process.uptime());
  const totalCmds = plugins.size;

  const caption = `╭─〘 🐺 ${settings.botName} 〙─
│
│ *🐺 WOLF INFO*
│ • Bot: ${settings.botName}
│ • Alpha: ${settings.ownerName}
│ • Prefix: [ ${settings.prefix} ]
│ • Version: ${settings.version}
│ • Mode: Pairing Code
│ • Uptime: ${uptime}
│ • Total: ${totalCmds} Commands
│ • Platform: ${process.platform}
│
╰─━━━━━━━━━━━━━━━━━

╭─〘 🐺 MODERATOR PACK (50) 〙
│ kick • add • promote • demote • warn
│ mute • ban • delete • tagall • hidetag
╰─

╭─〘 🐾 GROUP PACK (50) 〙
│ ginfo • setname • setdesc • open • close
│ link • poll • welcome • goodbye
╰─

╭─〘 🤖 AUTO HOWL (50) 〙
│ autostatus • autoread • autolike
│ autotyping • autopresence • autobio
│ autowelcome • autogreet • autotranslate
╰─

╭─〘 🚫 ANTI WOLF (50) 〙
│ antilink • antibot • antispam
│ antivirtex • antidelete • antisticker
╰─

╭─〘 👑 ALPHA ONLY (50) 〙
│ restart • broadcast • block • eval
│ mode • public • self • setpp • join
╰─

╭─〘 🐺 AI WOLF (10) • TOOLS (20) • VV (5) 〙
│ gpt • gemini • imagine • sticker
│ toimg • vv • bug45 • etc
╰─

> © 2026 ${settings.botName} WOLF PACK by ${settings.ownerName}
> 🔗 https://whatsapp.com/channel/0029Vb97vPwChq6GqI44n61S
`;

  const image = "https://files.catbox.moe/3zzdcg.jpg";

  const buttons = [
    {
      buttonId: `${settings.prefix}allmenu`,
      buttonText: { displayText: "📜 FULL MENU" },
      type: 1
    },
    {
      buttonId: `${settings.prefix}ping`,
      buttonText: { displayText: "⚡ SPEED" },
      type: 1
    },
    {
      buttonId: `${settings.prefix}owner`,
      buttonText: { displayText: "👑 OWNER" },
      type: 1
    }
  ];

  await sock.sendMessage(from, {
    image: { url: image },
    caption: caption,
    footer: `> Type ${settings.prefix}allmenu for all ${totalCmds} commands`,
    buttons: buttons,
    headerType: 4
  }, { quoted: m });
}
},
{
name: "allmenu",
alias: ["fullmenu", "340menu", "full"],
category: "general",
desc: "Show all commands with image",
async execute(m, { sock, from, plugins }) {
  const uptime = runtime(process.uptime());
  const image = "https://files.catbox.moe/3zzdcg.jpg";

  let text = `*╭─〘 🐺 ${settings.botName} FULL MENU 〙─*\n`;
  text += `*│ Total: ${plugins.size} | Uptime: ${uptime}*\n*╰─*\n\n`;
  
  const categories = {};
  for (let [name, cmd] of plugins) {
    const cat = (cmd.category || 'other').toLowerCase();
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
  }
  
  const emojiMap = {
    general: '🐺', moderator: '🐺', group: '🐾',
    auto: '🤖', anti: '🚫', owner: '👑',
    settings: '⚙️', vv: '👁️', bug: '🐛',
    ai: '🧠', tools: '🛠️', other: '🐺'
  };
  
  for (let cat in categories) {
    const emoji = emojiMap[cat] || '🐺';
    text += `╭─〘 ${emoji} ${cat.toUpperCase()} (${categories[cat].length}) 〙\n`;
    text += `│ ${categories[cat].map(c => `${settings.prefix}${c}`).join(' • ')}\n`;
    text += `╰─\n\n`;
  }
  
  text += `> © 2026 ${settings.botName} WOLF PACK\n`;
  text += `> 🔗 https://whatsapp.com/channel/0029Vb97vPwChq6GqI44n61S`;

  if (text.length > 4000) {
    await sock.sendMessage(from, {
      image: { url: image },
      caption: text.slice(0, 4000),
      footer: `Full ${plugins.size} commands`
    }, { quoted: m });
    
    const remaining = text.slice(4000);
    const parts = remaining.match(/[\s\S]{1,4000}/g);
    for (let part of parts) {
      await sock.sendMessage(from, { text: part }, { quoted: m });
    }
  } else {
    await sock.sendMessage(from, {
      image: { url: image },
      caption: text,
      footer: `Prefix: ${settings.prefix} | ${settings.botName}`
    }, { quoted: m });
  }
}
}
];

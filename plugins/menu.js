
const settings = require('../settings');
const { runtime } = require('../lib/functions');

const IMAGE = 'https://files.catbox.moe/3zzdcg.jpg';
const CHANNEL = 'https://whatsapp.com/channel/0029Vb97vPwChq6GqI44n61S';

const ORDER = [
  'general', 'moderator', 'group', 'auto', 'anti',
  'owner', 'ai', 'downloader', 'audio', 'converter',
  'logo', 'tools', 'games', 'fun', 'pies', 'premium',
  'settings', 'vv', 'bug', 'bot'
];

const EMOJI = {
  general: '🐺', moderator: '🛡️', group: '👥',
  auto: '🤖', anti: '🚫', owner: '👑',
  settings: '⚙️', vv: '👁️', bug: '🐛',
  ai: '🧠', tools: '🛠️', downloader: '📥',
  audio: '🎵', converter: '🔄', logo: '🎨',
  games: '🎮', fun: '😂', pies: '🥧',
  premium: '💎', bot: '🤖', other: '✧'
};

const TITLE = {
  general: 'GENERAL',
  moderator: 'MODERATOR',
  group: 'GROUP',
  auto: 'AUTOMATION',
  anti: 'ANTI PROTECTION',
  owner: 'OWNER',
  settings: 'SETTINGS',
  vv: 'VIEW ONCE',
  bug: 'BUG',
  ai: 'AI WOLF',
  tools: 'TOOLS',
  downloader: 'DOWNLOADER',
  audio: 'AUDIO',
  converter: 'CONVERTER',
  logo: 'LOGO MAKER',
  games: 'GAMES',
  fun: 'FUN',
  pies: 'PIES',
  premium: 'PREMIUM',
  bot: 'BOT INFO'
};

// UNIQUE COMMAND COUNTER
function getRealCommands(plugins) {
  const seen = new Set();
  const out = [];

  for (const [, cmd] of plugins || []) {
    if (!cmd || !cmd.name) continue;

    const name = String(cmd.name).toLowerCase();

    if (seen.has(name)) continue;

    seen.add(name);
    out.push(cmd);
  }

  return out;
}

// CATEGORY DETECTION
function getCategory(cmd) {
  const c = String(cmd.category || 'general').toLowerCase();

  if (EMOJI[c]) return c;
  if (c.includes('moderator') || c.includes('mod')) return 'moderator';
  if (c.includes('group')) return 'group';
  if (c.includes('auto')) return 'auto';
  if (c.includes('anti')) return 'anti';
  if (c.includes('owner') || c.includes('alpha')) return 'owner';
  if (c.includes('setting') || c.includes('config')) return 'settings';
  if (c.includes('view') || c === 'vv') return 'vv';
  if (c.includes('bug')) return 'bug';
  if (c.includes('ai')) return 'ai';
  if (c.includes('download')) return 'downloader';
  if (c.includes('audio') || c.includes('music')) return 'audio';
  if (c.includes('convert')) return 'converter';
  if (c.includes('logo')) return 'logo';
  if (c.includes('game')) return 'games';
  if (c.includes('fun')) return 'fun';
  if (c.includes('premium')) return 'premium';
  if (c.includes('tool')) return 'tools';
  if (c.includes('bot')) return 'bot';

  return 'general';
}

// GROUP COMMANDS
function groupCommands(commands, prefix = '') {
  const cats = {};

  for (const cmd of commands) {
    const cat = getCategory(cmd);

    if (!cats[cat]) cats[cat] = [];

    cats[cat].push(`${prefix}${cmd.name}`);
  }

  for (const key of Object.keys(cats)) {
    cats[key] = [...new Set(cats[key])].sort();
  }

  return cats;
}

// CELESTIAL LUXURY CATEGORY DESIGN
function buildCategoryBox(category, names) {
  const emoji = EMOJI[category] || '✧';
  const title = TITLE[category] || category.toUpperCase();

  let out = '';

  out += `\n      ⋆｡°✩  ${emoji} ${title}  ✩°｡⋆\n`;
  out += `      ╭─────── ⋆ ───────╮\n`;
  out += `         ✧ COMMANDS: ${names.length}\n`;
  out += `      ╰─────── ⋆ ───────╯\n\n`;

  for (const name of names) {
    out += `       ✦ ${name}\n`;
  }

  out += `\n       ──────♡──────\n`;

  return out;
}

// MENU HEADER
function buildHeader(commands, uptime, isFull = false) {
  const bot = settings.botName || 'ZENITH XMD';
  const owner = settings.ownerName || 'SIMON';

  return (
    `\n` +
    `       ⋆｡°✩  𝐙𝐄𝐍𝐈𝐓𝐇 𝐗𝐌𝐃  ✩°｡⋆\n` +
    `       ⟡━━━━━━━━━━━━━━━━━━⟡\n\n` +
    `          ♕  BOT PROFILE  ♕\n` +
    `       ╭─────── ⋆ ───────╮\n\n` +
    `       ✦ NAME     ⟶ ${bot}\n` +
    `       ✦ DEVELOPER ⟶ ${owner}\n` +
    `       ✦ USER     ⟶ @USER\n` +
    `       ✦ PREFIX   ⟶ ${settings.prefix}\n` +
    `       ✦ VERSION  ⟶ ${settings.version || '2.0.0'}\n` +
    `       ✦ MODE     ⟶ PUBLIC\n` +
    `       ✦ PLATFORM ⟶ WHATSAPP\n` +
    `       ✦ UPTIME   ⟶ ${uptime}\n` +
    `       ✦ COMMANDS ⟶ ${commands.length}\n\n` +
    `       ╰─────── ⋆ ───────╯\n\n` +
    `          ✧ ${isFull ? 'COMPLETE COMMAND LIST' : 'COMMAND CENTER'} ✧\n` +
    `       ⟡━━━━━━━━━━━━━━━━━━⟡\n`
  );
}

// MENU FOOTER
function buildFooter() {
  return (
    `\n\n` +
    `       ⋆｡°✩  THANK YOU  ✩°｡⋆\n` +
    `       ⟡━━━━━━━━━━━━━━━━━━⟡\n\n` +
    `       ✦ BOT: ${settings.botName || 'ZENITH XMD'}\n` +
    `       ✦ DEVELOPER: ${settings.ownerName || 'SIMON'}\n` +
    `       ✦ CHANNEL: JOIN BELOW\n\n` +
    `       ╰─────── ⋆ ───────╯\n\n` +
    `          ♡ POWERED BY SIMON TECH ♡\n`
  );
}

// NORMAL MENU
function buildMenuText(commands, uptime) {
  let out = buildHeader(commands, uptime);

  const cats = groupCommands(commands);

  for (const cat of ORDER) {
    if (!cats[cat]?.length) continue;

    out += buildCategoryBox(cat, cats[cat]);
  }

  for (const cat of Object.keys(cats)) {
    if (ORDER.includes(cat)) continue;

    out += buildCategoryBox(cat, cats[cat]);
  }

  out += buildFooter();
  out += `\n> Use ${settings.prefix}allmenu for the complete list`;

  return out;
}

// COMPLETE MENU
function buildAllMenu(commands, uptime) {
  let out = buildHeader(commands, uptime, true);

  const cats = groupCommands(commands, settings.prefix);

  for (const cat of ORDER) {
    if (!cats[cat]?.length) continue;

    out += buildCategoryBox(cat, cats[cat]);
  }

  for (const cat of Object.keys(cats)) {
    if (ORDER.includes(cat)) continue;

    out += buildCategoryBox(cat, cats[cat]);
  }

  out += buildFooter();

  return out;
}

// SPLIT LONG MESSAGES
async function sendLong(sock, from, m, image, text, footer) {
  const LIMIT = 3500;
  const chunks = [];

  let rem = text;

  while (rem.length > LIMIT) {
    let split = rem.lastIndexOf('\n', LIMIT);

    if (split < LIMIT * 0.5) {
      split = LIMIT;
    }

    chunks.push(rem.slice(0, split));
    rem = rem.slice(split).trimStart();
  }

  if (rem) chunks.push(rem);

  try {
    await sock.sendMessage(
      from,
      {
        image: { url: image },
        caption: chunks[0],
        footer
      },
      { quoted: m }
    );
  } catch (err) {
    await sock.sendMessage(
      from,
      { text: chunks[0] },
      { quoted: m }
    );
  }

  for (let i = 1; i < chunks.length; i++) {
    await sock.sendMessage(
      from,
      { text: chunks[i] },
      { quoted: m }
    );
  }
}

// HIDDEN URL CHANNEL BUTTON
async function sendChannelButton(sock, from, m) {
  try {
    await sock.sendMessage(
      from,
      {
        text: '⋆｡°✩ JOIN THE OFFICIAL ZENITH XMD CHANNEL ✩°｡⋆',
        footer: 'ZENITH XMD • SIMON TECH',
        templateButtons: [
          {
            index: 1,
            urlButton: {
              displayText: '✧ JOIN CHANNEL',
              url: CHANNEL
            }
          }
        ]
      },
      { quoted: m }
    );
  } catch (err) {
    console.error('[ZENITH CHANNEL BUTTON]', err.message);
  }
}

// EXPORT COMMANDS
module.exports = [
  {
    name: 'menu',
    alias: ['help', 'list', 'commands'],
    category: 'general',
    desc: 'Display Zenith XMD command menu',

    async execute(m, { sock, from, plugins }) {
      const commands = getRealCommands(plugins);
      const uptime = runtime(process.uptime());

      const text = buildMenuText(commands, uptime);

      await sendLong(
        sock,
        from,
        m,
        IMAGE,
        text,
        `✧ ZENITH XMD | ${commands.length} Commands`
      );

      await sendChannelButton(sock, from, m);
    }
  },

  {
    name: 'allmenu',
    alias: ['fullmenu', '340menu', 'full', 'all'],
    category: 'general',
    desc: 'Display complete Zenith XMD command list',

    async execute(m, { sock, from, plugins }) {
      const commands = getRealCommands(plugins);
      const uptime = runtime(process.uptime());

      const text = buildAllMenu(commands, uptime);

      await sendLong(
        sock,
        from,
        m,
        IMAGE,
        text,
        `ZENITH XMD | COMPLETE LIST`
      );

      await sendChannelButton(sock, from, m);
    }
  }
];
  

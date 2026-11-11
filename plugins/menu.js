
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
 general: '🐺',
  moderator: '🛡️',
 group: '👥',
  auto: '🤖',
  anti: '🚫',
  owner: '👑',
  settings: '⚙️',
  vv: '👁️',
  bug: '🐛',
  ai: '🧠',
  tools: '🛠️',
  downloader: '📥',
  audio: '🎵',
  converter: '🔄',
  logo: '🎨',
  games: '🎮',
  fun: '😂',
  pies: '🥧',
  premium: '💎',
  bot: '🤖',
  other: '🐺'
};

const TITLE = {
  general: 'GENERAL COMMANDS',
  moderator: 'MODERATOR',
  group: 'GROUP MANAGEMENT',
  auto: 'AUTOMATION',
  anti: 'ANTI PROTECTION',
  owner: 'OWNER COMMANDS',
  settings: 'BOT SETTINGS',
  vv: 'VIEW ONCE',
  bug: 'BUG COMMANDS',
  ai: 'ARTIFICIAL INTELLIGENCE',
  tools: 'TOOLS',
  downloader: 'DOWNLOADER',
  audio: 'AUDIO',
  converter: 'CONVERTER',
  logo: 'LOGO MAKER',
  games: 'GAMES',
  fun: 'FUN COMMANDS',
  pies: 'PIES',
  premium: 'PREMIUM',
  bot: 'BOT INFORMATION'
};

function getRealCommands(plugins) {
  const seen = new Set();
  const commands = [];

  for (const [, cmd] of plugins || []) {
    if (!cmd || !cmd.name) continue;

    const name = String(cmd.name).toLowerCase();

    if (seen.has(name)) continue;

    seen.add(name);
    commands.push(cmd);
  }

  return commands;
}

function getCategory(cmd) {
  const category = String(cmd.category || 'general').toLowerCase();

  if (EMOJI[category]) return category;

  if (category.includes('moderator') || category.includes('mod')) return 'moderator';
  if (category.includes('group')) return 'group';
  if (category.includes('auto')) return 'auto';
  if (category.includes('anti')) return 'anti';
  if (category.includes('owner') || category.includes('alpha')) return 'owner';
  if (category.includes('setting') || category.includes('config')) return 'settings';
  if (category.includes('view') || category === 'vv') return 'vv';
  if (category.includes('bug')) return 'bug';
  if (category.includes('ai')) return 'ai';
  if (category.includes('download')) return 'downloader';
  if (category.includes('audio') || category.includes('music')) return 'audio';
  if (category.includes('convert')) return 'converter';
  if (category.includes('logo')) return 'logo';
  if (category.includes('game')) return 'games';
  if (category.includes('fun')) return 'fun';
  if (category.includes('premium')) return 'premium';
  if (category.includes('tool')) return 'tools';
  if (category.includes('bot')) return 'bot';

  return 'general';
}

function groupCommands(commands, prefix = '') {
  const categories = {};

  for (const cmd of commands) {
    const category = getCategory(cmd);

    if (!categories[category]) categories[category] = [];

    categories[category].push(`${prefix}${cmd.name}`);
  }

  for (const category of Object.keys(categories)) {
    categories[category] = [...new Set(categories[category])].sort();
  }

  return categories;
}

function buildHeader(commands, uptime) {
  return [
    `╭━━〔 🐺 ${settings.botName} 〕━━╮`,
    '┃',
    '┃ ✦ BOT INFORMATION',
    `┃ ❖ Bot: ${settings.botName}`,
    `┃ ❖ Alpha: ${settings.ownerName}`,
    `┃ ❖ Prefix: ${settings.prefix}`,
    `┃ ❖ Version: ${settings.version || 'PEAK V2'}`,
    '┃ ❖ Connection: MULTI-DEVICE',
    `┃ ❖ Uptime: ${uptime}`,
    `┃ ❖ Commands: ${commands.length}`,
    `┃ ❖ Platform: ${process.platform}`,
    '┃',
    '╰━━━━━━━━━━━━━━━━━━╯',
    ''
  ].join('\n');
}

function buildCategory(category, names) {
  const emoji = EMOJI[category] || '🐺';
  const title = TITLE[category] || category.toUpperCase();

  let output = `╭━━〔 ${emoji} ${title} • ${names.length} 〕\n`;

  for (let i = 0; i < names.length; i += 4) {
    output += `┃ ${names.slice(i, i + 4).join(' • ')}\n`;
  }

  output += '╰━━━━━━━━━━━━━━━━━━\n\n';

  return output;
}

function buildMenuText(commands, uptime) {
  let output = buildHeader(commands, uptime);

  const categories = groupCommands(commands);

  for (const category of ORDER) {
    if (!categories[category]?.length) continue;

    output += buildCategory(category, categories[category]);
  }

  for (const category of Object.keys(categories)) {
    if (ORDER.includes(category)) continue;

    output += buildCategory(category, categories[category]);
  }

  output += [
    `> © 2026 ${settings.botName}`,
    `> Developer: ${settings.ownerName}`,
    `> Channel: ${CHANNEL}`,
    `> Use ${settings.prefix}allmenu for the complete list`
  ].join('\n');

  return output;
}

function buildAllMenu(commands, uptime) {
  let output = [
    `╭━━〔 🐺 ${settings.botName} FULL MENU 〕━━╮`,
    `┃ Commands: ${commands.length}`,
    `┃ Uptime: ${uptime}`,
    `┃ Prefix: ${settings.prefix}`,
    '╰━━━━━━━━━━━━━━━━━━╯',
    ''
  ].join('\n');

  const categories = groupCommands(commands, settings.prefix);

  for (const category of ORDER) {
    if (!categories[category]?.length) continue;

    output += buildCategory(category, categories[category]);
  }

  for (const category of Object.keys(categories)) {
    if (ORDER.includes(category)) continue;

    output += buildCategory(category, categories[category]);
  }

  output += `> © 2026 ${settings.botName}\n`;
  output += `> Developer: ${settings.ownerName}\n`;
  output += `> Channel: ${CHANNEL}`;

  return output;
}

async function sendLong(sock, from, m, image, text, footer) {
  const LIMIT = 3500;

  const chunks = [];
  let remaining = text;

  while (remaining.length > LIMIT) {
    let split = remaining.lastIndexOf('\n', LIMIT);

    if (split < LIMIT * 0.5) split = LIMIT;

    chunks.push(remaining.slice(0, split));
    remaining = remaining.slice(split).trimStart();
  }

  if (remaining) chunks.push(remaining);

  try {
    await sock.sendMessage(from, {
      image: { url: image },
      caption: chunks[0],
      footer
    }, { quoted: m });
  } catch (error) {
    await sock.sendMessage(from, {
      text: chunks[0]
    }, { quoted: m });
  }

  for (let i = 1; i < chunks.length; i++) {
    await sock.sendMessage(from, {
      text: chunks[i]
    }, { quoted: m });
  }
}

module.exports = [
  {
    name: 'menu',
    alias: ['help', 'list', 'commands'],
    category: 'general',
    desc: 'Display organized bot command menu',

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
        `🐺 ${settings.botName} | ${commands.length} Commands`
      );
    }
  },

  {
    name: 'allmenu',
    alias: ['fullmenu', '340menu', 'full', 'all'],
    category: 'general',
    desc: 'Display complete bot command list',

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
        `${settings.botName} | COMPLETE COMMAND LIST`
      );
    }
  }
];
  

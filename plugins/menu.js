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
  premium: '💎', bot: '🤖', other: '🐺'
};

const TITLE = {
  general: 'GENERAL', moderator: 'MODERATOR', group: 'GROUP',
  auto: 'AUTOMATION', anti: 'ANTI PROTECTION', owner: 'OWNER',
  settings: 'SETTINGS', vv: 'VIEW ONCE', bug: 'BUG',
  ai: 'AI WOLF', tools: 'TOOLS', downloader: 'DOWNLOADER',
  audio: 'AUDIO', converter: 'CONVERTER', logo: 'LOGO MAKER',
  games: 'GAMES', fun: 'FUN', pies: 'PIES',
  premium: 'PREMIUM', bot: 'BOT INFO'
};

// ✅ UNIQUE ASCII BOX PER CATEGORY - no repeat
const BOX = {
  general:   { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'─', v:'│' }, // round
  moderator: { tl:'┏', tr:'┓', bl:'┗', br:'┛', h:'━', v:'┃' }, // thick
  group:     { tl:'╔', tr:'╗', bl:'╚', br:'╝', h:'═', v:'║' }, // double
  auto:      { tl:'┌', tr:'┐', bl:'└', br:'┘', h:'─', v:'│' }, // single
  anti:      { tl:'▛', tr:'▟', bl:'▙', br:'▜', h:'▀', v:'▌' }, // block
  owner:     { tl:'◤', tr:'◥', bl:'◣', br:'◢', h:'─', v:'│' }, // diamond
  ai:        { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'═', v:'║' }, // round-double
  downloader:{ tl:'┏', tr:'┓', bl:'┗', br:'┛', h:'─', v:'│' }, // thick-single
  audio:     { tl:'╔', tr:'╗', bl:'╚', br:'╝', h:'─', v:'│' }, // double-single
  converter: { tl:'┌', tr:'┐', bl:'└', br:'┘', h:'━', v:'┃' }, // single-thick
  logo:      { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'⋯', v:'⋮' }, // dotted
  tools:     { tl:'┏', tr:'┓', bl:'┗', br:'┛', h:'═', v:'║' }, // thick-double
  games:     { tl:'╔', tr:'╗', bl:'╚', br:'╝', h:'━', v:'┃' }, // double-thick
  fun:       { tl:'┌', tr:'┐', bl:'└', br:'┘', h:'═', v:'║' }, // single-double
  pies:      { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'━', v:'┃' }, // round-thick
  premium:   { tl:'✦', tr:'✦', bl:'✦', br:'✦', h:'─', v:'│' }, // star premium
  settings:  { tl:'┏', tr:'┓', bl:'┗', br:'┛', h:'⋯', v:'⋮' }, // thick-dotted
  vv:        { tl:'╔', tr:'╗', bl:'╚', br:'╝', h:'⋯', v:'⋮' }, // double-dotted
  bug:       { tl:'┌', tr:'┐', bl:'└', br:'┘', h:'⋯', v:'⋮' }, // single-dotted
  bot:       { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'─', v:'│' },
  other:     { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'─', v:'│' }
};

function getRealCommands(plugins){
  const seen = new Set(); const out = [];
  for (const [,cmd] of plugins || []){
    if(!cmd || !cmd.name) continue;
    const n = String(cmd.name).toLowerCase();
    if(seen.has(n)) continue; seen.add(n); out.push(cmd);
  }
  return out;
}

function getCategory(cmd){
  const c = String(cmd.category || 'general').toLowerCase();
  if(EMOJI[c]) return c;
  if(c.includes('moderator')||c.includes('mod')) return 'moderator';
  if(c.includes('group')) return 'group';
  if(c.includes('auto')) return 'auto';
  if(c.includes('anti')) return 'anti';
  if(c.includes('owner')||c.includes('alpha')) return 'owner';
  if(c.includes('setting')||c.includes('config')) return 'settings';
  if(c.includes('view')||c==='vv') return 'vv';
  if(c.includes('bug')) return 'bug';
  if(c.includes('ai')) return 'ai';
  if(c.includes('download')) return 'downloader';
  if(c.includes('audio')||c.includes('music')) return 'audio';
  if(c.includes('convert')) return 'converter';
  if(c.includes('logo')) return 'logo';
  if(c.includes('game')) return 'games';
  if(c.includes('fun')) return 'fun';
  if(c.includes('premium')) return 'premium';
  if(c.includes('tool')) return 'tools';
  if(c.includes('bot')) return 'bot';
  return 'general';
}

function groupCommands(commands, prefix=''){
  const cats = {};
  for(const cmd of commands){
    const cat = getCategory(cmd);
    if(!cats[cat]) cats[cat]=[];
    cats[cat].push(`${prefix}${cmd.name}`);
  }
  for(const k of Object.keys(cats)) cats[k]=[...new Set(cats[k])].sort();
  return cats;
}

// ✅ Build box with unique style
function buildBox(category, titleLine, lines){
  const b = BOX[category] || BOX.other;
  const width = 32;
  const top = b.tl + b.h.repeat(width) + b.tr;
  const bottom = b.bl + b.h.repeat(width) + b.br;
  let out = `${top}\n${b.v} ${titleLine}\n${b.v} ${b.h.repeat(width-2)}\n`;
  for(const l of lines) out += `${b.v} ${l}\n`;
  out += `${bottom}\n\n`;
  return out;
}

function buildCategoryBox(category, names){
  const emoji = EMOJI[category] || '🐺';
  const title = TITLE[category] || category.toUpperCase();
  const titleLine = `${emoji} ${title} • ${names.length}`;
  const lines = [];
  for(let i=0;i<names.length;i+=4){
    lines.push(names.slice(i,i+4).join(' • '));
  }
  return buildBox(category, titleLine, lines);
}

function buildHeader(commands, uptime, isFull=false){
  const b = BOX.group; // double box for header - unique
  const title = isFull ? `🐺 ${settings.botName} FULL MENU` : `🐺 ${settings.botName}`;
  return (
    `${b.tl}${b.h.repeat(32)}${b.tr}\n` +
    `${b.v} ${title}\n` +
    `${b.v} ${b.h.repeat(30)}\n` +
    `${b.v} ✦ Bot: ${settings.botName}\n` +
    `${b.v} ✦ Alpha: ${settings.ownerName}\n` +
    `${b.v} ✦ Prefix: ${settings.prefix}\n` +
    `${b.v} ✦ Version: ${settings.version || 'PEAK V2'}\n` +
    `${b.v} ✦ Mode: Pairing Code\n` +
    `${b.v} ✦ Uptime: ${uptime}\n` +
    `${b.v} ✦ Commands: ${commands.length}\n` +
    `${b.v} ✦ Platform: ${process.platform}\n` +
    `${b.bl}${b.h.repeat(32)}${b.br}\n\n`
  );
}

function buildFooter(){
  return [
    `┌──────────────────────────────┐`,
    `│ © 2026 ${settings.botName}`,
    `│ Developer: ${settings.ownerName}`,
    `│ Channel: ${CHANNEL}`,
    `└──────────────────────────────┘`
  ].join('\n');
}

function buildMenuText(commands, uptime){
  let out = buildHeader(commands, uptime, false);
  const cats = groupCommands(commands);
  for(const cat of ORDER){
    if(!cats[cat]?.length) continue;
    out += buildCategoryBox(cat, cats[cat]);
  }
  for(const cat of Object.keys(cats)){
    if(ORDER.includes(cat)) continue;
    out += buildCategoryBox(cat, cats[cat]);
  }
  out += buildFooter();
  out += `\n> Use ${settings.prefix}allmenu for full list`;
  return out;
}

function buildAllMenu(commands, uptime){
  let out = buildHeader(commands, uptime, true);
  const cats = groupCommands(commands, settings.prefix);
  for(const cat of ORDER){
    if(!cats[cat]?.length) continue;
    out += buildCategoryBox(cat, cats[cat]);
  }
  for(const cat of Object.keys(cats)){
    if(ORDER.includes(cat)) continue;
    out += buildCategoryBox(cat, cats[cat]);
  }
  out += buildFooter();
  return out;
}

async function sendLong(sock, from, m, image, text, footer){
  const LIMIT = 3500;
  const chunks = []; let rem = text;
  while(rem.length > LIMIT){
    let split = rem.lastIndexOf('\n', LIMIT);
    if(split < LIMIT*0.5) split = LIMIT;
    chunks.push(rem.slice(0, split)); rem = rem.slice(split).trimStart();
  }
  if(rem) chunks.push(rem);
  try{
    await sock.sendMessage(from, { image:{url:image}, caption:chunks[0], footer }, { quoted:m });
  }catch{ await sock.sendMessage(from, { text:chunks[0] }, { quoted:m }); }
  for(let i=1;i<chunks.length;i++) await sock.sendMessage(from, { text:chunks[i] }, { quoted:m });
}

module.exports = [
  {
    name:'menu', alias:['help','list','commands'], category:'general', desc:'Display organized bot command menu',
    async execute(m,{sock,from,plugins}){
      const commands = getRealCommands(plugins);
      const uptime = runtime(process.uptime());
      const text = buildMenuText(commands, uptime);
      await sendLong(sock, from, m, IMAGE, text, `🐺 ${settings.botName} | ${commands.length} Commands`);
    }
  },
  {
    name:'allmenu', alias:['fullmenu','340menu','full','all'], category:'general', desc:'Display complete bot command list',
    async execute(m,{sock,from,plugins}){
      const commands = getRealCommands(plugins);
      const uptime = runtime(process.uptime());
      const text = buildAllMenu(commands, uptime);
      await sendLong(sock, from, m, IMAGE, text, `${settings.botName} | COMPLETE LIST`);
    }
  }
];

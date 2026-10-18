const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const fs = require('fs');

let config;
try {
  config = require('../settings');
} catch {
  config = {
    botName: "ZENITH-XMD",
    ownerName: "ZENITH",
    ownerNumber: "2348071569915",
    prefix: ".",
    sessionName: "auth",
    PORT: process.env.PORT || 10000
  };
}

global.sock = null;
global.isConnected = false;
global.connectionStatus = '⚠️ NOT LINKED - Go to Dashboard to Pair';
global.pairingCode = null;
global.currentPairingNumber = null;
global.lastPairTime = 0;
global.appStarted = false;

const controlFile = path.join(__dirname, '../control.json');
let controlSettings = {
  OWNER: true, BOT: true, GROUP: true, AI: true, DOWNLOADER: true,
  AUDIO: true, CONVERTER: true, LOGO: true, TOOLS: true,
  GAMES: true, FUN: true, PIES: true, PREMIUM: true,
  disabledCmds: []
};
try {
  if (fs.existsSync(controlFile)) {
    const data = JSON.parse(fs.readFileSync(controlFile, 'utf8'));
    if(data.disabledCmds && data.disabledCmds.includes('*all*')){
      console.log(chalk.yellow('⚠️ control.json locked - Auto reset to ON'));
      controlSettings.disabledCmds = [];
      fs.writeFileSync(controlFile, JSON.stringify(controlSettings, null, 2));
    } else {
      controlSettings = data;
    }
  }
} catch(e){}
global.controlSettings = controlSettings;
function saveControl(){
  try {
    fs.writeFileSync(controlFile, JSON.stringify(controlSettings, null, 2));
    global.controlSettings = controlSettings;
  } catch {}
}

const CATEGORY_MAP = {
  OWNER: ['mode','settings','password','setprefix','delprefix','setpp','setbotbio','autobio','autostatus','autotyping','autorecording','autoreact','anticall','antidelete','antiviewonce','addsudo','delsudo','sudolist','block','unblock','ban','unban','save','schedulestatus','chatbot','clearsession','cleartmp','pair','checkidch'],
  BOT: ['owner','ping','alive','runtime','repo'],
  GROUP: ['add','kick','kickall','promote','demote','mute','unmute','lockgroup','unlockgroup','revoke','grouplink','setname','setdesc','setgcpp','gcstatus','creategc','leavegc','groupinfo','staff','jid','tagall','tag','hidetag','tagadmins','online','onlineusers','onlineadmins','onlinestats','welcome','goodbye','rules','poll','afk','couple','antilink','antitag','antigroupmention','antigroupstatus','antibot','antibadword','slowmode','warn','warnings'],
  AI: ['ai','gpt','gemini','imagine','flux','dalle','txt2video','sora','imageedit'],
  DOWNLOADER: ['play','song','music','ytmp3','mp3','ytmp4','video','instagram','tiktok','tt','facebook','fb','pinterest','anime','gitclone','apk','pixabay','gif','tourl'],
  AUDIO: ['bass','deep','blown','earrape','fast','slow','fat','squirrel','nightcore','robot','areverse','tomp3','tts'],
  CONVERTER: ['sticker','s','simage','toimg','removebg','upscale','take','attp','qc','emojimix','tgsticker','blur','meme','getpp','wasted','character'],
  LOGO: ['fancy','gfx','gfx2','gfx3','gfx4','gfx5','gfx6','gfx7','gfx8','gfx9','gfx10','gfx11','gfx12','metallic','ice','snow','impressive','matrix','neon','light','devil','purple','thunder','leaves','1917','arena','hacker','sand','blackpink','glitch','fire'],
  TOOLS: ['ss','ssweb','translate','tr','qrcode','qr','shorturl','urlshortener','calculator','calc','hash','base64','binary','encrypt','decrypt','timestamp','currency','crypto','weather','news','livescore','reminder','lyrics','count','reverse','case','palindrome','age','vv','vv2','delete','savecontact','device','netflix'],
  GAMES: ['trivia','scramble','wordle','hangman','guess','ttt','tictactoe','wyr','rps','slots','truth','dare','riddle','8ball','dice','coin','random','pick'],
  FUN: ['joke','fact','quote','compliment','insult','roast','flirt','ship','simp','stupid','shayari','goodnight','roseday','iloveyou'],
  PIES: ['pies','india','china','japan','korea','thai','malaysia'],
  PREMIUM: ['premium','setbotpp','autoreply','away','schedule','filter','persona','ghost']
};
function getCategory(cmd){
  cmd = cmd.toLowerCase();
  for(const [cat, cmds] of Object.entries(CATEGORY_MAP)){
    if(cmds.includes(cmd)) return cat;
  }
  return null;
}

global.plugins = new Map();

function loadPlugins() {
  const pluginsPath = path.join(__dirname, '../plugins');
  if (!fs.existsSync(pluginsPath)) {
    console.log(chalk.red('❌ plugins folder not found'));
    return;
  }
  global.plugins.clear();
  let totalCmds = 0;
  let fileCount = 0;
  function readDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readDir(fullPath);
      } else if (item.endsWith('.js')) {
        fileCount++;
        try {
          delete require.cache[require.resolve(fullPath)];
          const pluginData = require(fullPath);
          const pluginsArray = Array.isArray(pluginData) ? pluginData : [pluginData];
          for (const plugin of pluginsArray) {
            if (plugin && plugin.name && plugin.execute) {
              global.plugins.set(plugin.name.toLowerCase(), plugin);
              if (plugin.alias && Array.isArray(plugin.alias)) {
                for (const a of plugin.alias) global.plugins.set(a.toLowerCase(), plugin);
              }
              console.log(chalk.green(`✅ ${item} → ${plugin.name}`));
              totalCmds++;
            }
          }
        } catch (e) {
          console.log(chalk.red(`❌ Error loading ${item}: ${e.message}`));
        }
      }
    }
  }
  readDir(pluginsPath);
  console.log(chalk.green.bold(`\n✅ Loaded ${totalCmds} cmds from ${fileCount} files (${global.plugins.size} aliases)\n`));
}
loadPlugins();

async function startConnection() {
  if (!global.appStarted) {
    const app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    app.get('/health', (req, res) => res.send('ZENITH-XMD LIVE'));

    app.get('/api/status', (req, res) => {
      res.json({
        botName: "ZENITH-XMD",
        status: global.connectionStatus,
        isConnected: global.isConnected,
        pairingCode: global.pairingCode,
        plugins: global.plugins.size
      });
    });

    app.post('/api/pair', async (req, res) => {
      try {
        let phone = (req.body.phone || '').toString().replace(/[^0-9]/g, '');
        if (!phone || phone.length < 10) return res.json({ success: false, message: 'Enter valid number' });
        if (!global.sock) return res.json({ success: false, message: 'Bot starting... wait 5 sec' });
        if (global.isConnected) return res.json({ success: false, message: 'Already linked!' });
        global.lastPairTime = Date.now();
        global.pairingCode = null;
        const code = await global.sock.requestPairingCode(phone);
        global.pairingCode = code;
        global.currentPairingNumber = phone;
        global.connectionStatus = `🔑 CODE: ${code} - Link in WhatsApp`;
        console.log(chalk.yellow.bold(`🔑 NEW PAIR CODE FOR ${phone}: ${code}`));
        res.json({ success: true, code, phone });
      } catch (err) {
        console.log('Pair error:', err.message);
        global.pairingCode = null;
        res.json({ success: false, message: err.message + ' - wait 10 sec & try again' });
      }
    });

    app.post('/api/logout', async (req, res) => {
      try { if (global.sock) await global.sock.logout(); } catch {}
      try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {}
      global.isConnected = false;
      global.pairingCode = null;
      global.connectionStatus = '⚠️ NOT LINKED - Go to Dashboard to Pair';
      res.json({ success: true });
    });

    const PORT = config.PORT || process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(chalk.cyan.bold(`\n🌐 ZENITH DASHBOARD LIVE ON ${PORT}`));
      console.log(chalk.yellow.bold(`⚠️ IF NOT LINKED: Open dashboard to pair your number!\n`));
    });
    global.appStarted = true;
  }

  async function initBaileys() {
    const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionName}`);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Safari'),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      markOnlineOnConnect: true,
    });

    global.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'connecting') global.connectionStatus = 'Connecting to WhatsApp...';
      if (connection === 'open') {
        global.isConnected = true;
        global.connectionStatus = 'ZENITH-XMD ONLINE ✅';
        global.pairingCode = null;
        console.log(chalk.green.bold(`\n✅ ZENITH-XMD ONLINE!\n`));
        console.log(chalk.green.bold(`🏔️ TOTAL PLUGINS: ${global.plugins.size}\n`));
        loadPlugins();
        try {
          const botJid = sock.user.id;
          const botNumber = botJid.split('@')[0];
          let userName = sock.user.name || "User";
          let platform = process.env.RENDER ? "Render" : "VPS";
          let pfpUrl;
          try { pfpUrl = await sock.profilePictureUrl(botJid, 'image'); } catch { pfpUrl = null; }
          const caption = `╭━━━〔 ⚡ ZENITH XMD 〕━━━╮\n┃    ✅ LINK SUCCESSFUL\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👋 Welcome, ${userName}\n\nYour WhatsApp account has been successfully\nlinked and Zenith XMD is now active.\n\n╭─〔 👤 USER INFO 〕\n│\n├─ 👤 Name     : ${userName}\n├─ 📱 Number   : ${botNumber}\n├─ 🔣 Prefix   : .\n├─ 🔓 Mode     : Public\n├─ ☁️ Host     : ${platform}\n└─ 🔗 Session  : Connected\n╰────────────────────╯\n\n╭─〔 🤖 BOT STATUS 〕\n│\n├─ 🤖 Bot      : Zenith XMD\n├─ 🟢 Status   : Online\n├─ ⚡ Commands : Ready\n└─ 📅 Version  : 2026\n╰────────────────────╯\n\n╭─〔 🚀 QUICK START 〕\n│\n│  .menu  → Command Menu\n│  .ping  → Response Speed\n╰──────────────────╯\n\n🔐 SECURITY NOTICE\nKeep your session credentials private.\n\n   ⚡ *ZENITH XMD*\n\n「 POWERED FOR 2026 」\n━━━━━━━━━━━━━━━━━━━━━━━━`;
          if (pfpUrl) {
            await sock.sendMessage(botJid, { image: { url: pfpUrl }, caption: caption });
          } else {
            await sock.sendMessage(botJid, { text: caption });
          }
          console.log(chalk.green('📩 Self DM with PFP sent!'));
        } catch (err) {
          console.log('Self DM failed:', err.message);
        }
      }
      if (connection === 'close') {
        global.isConnected = false;
        global.connectionStatus = '⚠️ NOT LINKED - Open dashboard to pair';
        console.log(chalk.red.bold('❌ Disconnected - Need to link again via dashboard'));
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode !== DisconnectReason.loggedOut) setTimeout(() => initBaileys(), 3000);
      }
    });

    // ===== FIXED: SELF COMMANDS + NOTIFY =====
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      const m = messages[0];
      if (!m?.message) return;
      if (m.key.remoteJid === 'status@broadcast') return;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
      if (!text) return;
      if (!text.startsWith(config.prefix)) return;
      const args = text.slice(config.prefix.length).trim().split(/ +/);
      const cmdName = args.shift().toLowerCase();
      const essential = ['ping','alive','owner','menu','help'];
      if(!essential.includes(cmdName)){
        if(controlSettings.disabledCmds.includes('*all*')) return;
        if(controlSettings.disabledCmds.includes(cmdName)) return;
        const cat = getCategory(cmdName);
        if(cat && controlSettings[cat] === false) return;
      }
      const plugin = global.plugins.get(cmdName);
      if (plugin) {
        try {
          m.body = text; m.text = text; m.sender = m.key.remoteJid; m.fromMe = m.key.fromMe;
          await plugin.execute(m, { sock, prefix: config.prefix, args, command: cmdName, config, plugins: global.plugins, from: m.key.remoteJid });
        } catch (e) {
          console.log(`Exec error ${cmdName}: ${e.message}`);
        }
      }
    });
  }
  await initBaileys();
}
module.exports = { startConnection };

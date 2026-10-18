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
global.connectionStatus = 'Starting ZENITH-XMD...';
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

// ===== FIXED PLUGINS LOADER - RECURSIVE =====
function loadPlugins() {
  const pluginsPath = path.join(__dirname, '../plugins');
  if (!fs.existsSync(pluginsPath)) {
    console.log(chalk.red('❌ plugins folder not found'));
    return;
  }
  global.plugins.clear();

  function readDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readDir(fullPath);
      } else if (item.endsWith('.js')) {
        try {
          delete require.cache[require.resolve(fullPath)];
          const plugin = require(fullPath);
          if (plugin && plugin.name && plugin.execute) {
            global.plugins.set(plugin.name.toLowerCase(), plugin);
            if (plugin.alias && Array.isArray(plugin.alias)) {
              for (const a of plugin.alias) global.plugins.set(a.toLowerCase(), plugin);
            }
          } else if (plugin && typeof plugin === 'object') {
            const name = item.replace('.js','').toLowerCase();
            global.plugins.set(name, plugin);
          }
        } catch (e) {
          console.log(chalk.red(`❌ Error loading ${item}: ${e.message}`));
        }
      }
    }
  }

  readDir(pluginsPath);
  console.log(chalk.green.bold(`✅ Loaded ${global.plugins.size} ZENITH plugins`));
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
        const now = Date.now();
        if (global.pairingCode && (now - global.lastPairTime) < 50000) {
          return res.json({ success: true, code: global.pairingCode, phone: global.currentPairingNumber });
        }
        global.lastPairTime = now;
        const code = await global.sock.requestPairingCode(phone);
        global.pairingCode = code;
        global.currentPairingNumber = phone;
        global.connectionStatus = `CODE: ${code}`;
        res.json({ success: true, code, phone });
      } catch (err) {
        res.json({ success: false, message: err.message });
      }
    });

    app.post('/api/logout', async (req, res) => {
      try { if (global.sock) await global.sock.logout(); } catch {}
      try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {}
      global.isConnected = false;
      global.pairingCode = null;
      res.json({ success: true });
    });

    const PORT = config.PORT || process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(chalk.cyan.bold(`\n🌐 ZENITH DASHBOARD LIVE ON ${PORT}\n`));
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
      if (connection === 'connecting') global.connectionStatus = 'Connecting...';
      if (connection === 'open') {
        global.isConnected = true;
        global.connectionStatus = 'ZENITH-XMD ONLINE ✅';
        global.pairingCode = null;
        console.log(chalk.green.bold(`\n✅ ZENITH-XMD ONLINE!\n`));
        console.log(chalk.green.bold(`🏔️ TOTAL PLUGINS: ${global.plugins.size}\n`));
        
        loadPlugins();

        // ===== NEW SELF DM WITH BOT PFP =====
        try {
          const botJid = sock.user.id;
          const botNumber = botJid.split('@')[0];
          let userName = sock.user.name || "User";
          let phoneNumber = botNumber;
          let platform = process.env.RENDER ? "Render" : "VPS";
          let pfpUrl;
          try {
            pfpUrl = await sock.profilePictureUrl(botJid, 'image');
          } catch {
            pfpUrl = null;
          }

          const caption = `╭━━━〔 ⚡ ZENITH XMD 〕━━━╮
┃    ✅ LINK SUCCESSFUL
╰━━━━━━━━━━━━━━━━━━━━━━━╯

👋 Welcome, ${userName}

Your WhatsApp account has been successfully
linked and Zenith XMD is now active.

╭─〔 👤 USER INFO 〕
│
├─ 👤 Name     : ${userName}
├─ 📱 Number   : ${phoneNumber}
├─ 🔣 Prefix   : .
├─ 🔓 Mode     : Public
├─ ☁️ Host     : ${platform}
└─ 🔗 Session  : Connected
╰────────────────────╯

╭─〔 🤖 BOT STATUS 〕
│
├─ 🤖 Bot      : Zenith XMD
├─ 🟢 Status   : Online
├─ ⚡ Commands : Ready
└─ 📅 Version  : 2026
╰────────────────────╯

╭─〔 🚀 QUICK START 〕
│
│  .menu  → Command Menu
│  .ping  → Response Speed
╰──────────────────╯

🔐 SECURITY NOTICE
Keep your session credentials private.
Never share your session data or authentication
files with anyone.

   ⚡ *ZENITH XMD*

「 POWERED FOR 2026 」
━━━━━━━━━━━━━━━━━━━━━━━━`;

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
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode !== DisconnectReason.loggedOut) setTimeout(() => initBaileys(), 3000);
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      const m = messages[0];
      if (!m?.message || m.key.fromMe) return;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
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
          m.body = text; m.text = text; m.sender = m.key.remoteJid;
          await plugin.execute(m, { sock, prefix: config.prefix, args, command: cmdName, config, plugins: global.plugins });
        } catch (e) {}
      }
    });
  }

  await initBaileys();
}

module.exports = { startConnection };

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
  console.log(chalk.green.bold(`\n✅ Loaded ${totalCmds} cmds from ${fileCount} files\n`));
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
        res.json({ success: false, message: err.message });
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
      console.log(chalk.cyan.bold(`\n🌐 ZENITH DASHBOARD LIVE ON ${PORT}\n`));
    });

    // === FIX 2: KEEP ALIVE - FIX SLOW ===
    setInterval(() => {
      if(global.sock && global.isConnected){
        try { global.sock.sendPresenceUpdate('available'); console.log('♻️ Keep-alive'); } catch {}
      }
    }, 25 * 60 * 1000);

    global.appStarted = true;
  }

  async function initBaileys() {
    // === FIX 1: RESTORE SESSION FROM ENV - FIX LOGOUT ===
    try {
      const authPath = `./${config.sessionName}`;
      if ((!fs.existsSync(authPath) || fs.readdirSync(authPath).length === 0) && process.env.SESSION_DATA) {
        console.log(chalk.yellow('♻️ Restoring session from ENV...'));
        fs.mkdirSync(authPath, { recursive: true });
        const data = JSON.parse(process.env.SESSION_DATA);
        fs.writeFileSync(path.join(authPath, 'creds.json'), JSON.stringify(data, null, 2));
        console.log(chalk.green('✅ Session restored!'));
      }
    } catch(e){ console.log('Restore fail:', e.message) }

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
    sock.ev.on('creds.update', async () => {
      await saveCreds();
      // AUTO SAVE TO LOG FOR YOU TO COPY
      try {
        const credsPath = `./${config.sessionName}/creds.json`;
        if(fs.existsSync(credsPath)){
          console.log(chalk.cyan('💾 Creds updated - copy this for SESSION_DATA env if you want'));
        }
      } catch {}
    });
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'connecting') global.connectionStatus = 'Connecting to WhatsApp...';
      if (connection === 'open') {
        global.isConnected = true;
        global.connectionStatus = 'ZENITH-XMD ONLINE ✅';
        global.pairingCode = null;
        console.log(chalk.green.bold(`\n✅ ZENITH-XMD ONLINE!\n`));
        loadPlugins();
        try {
          const botJid = sock.user.id;
          let userName = sock.user.name || "User";
          let pfpUrl;
          try { pfpUrl = await sock.profilePictureUrl(botJid, 'image'); } catch { pfpUrl = null; }
          const caption = `✅ ZENITH XMD LINKED!\n\n👋 Welcome ${userName}\n\nType .menu to start`;
          if (pfpUrl) {
            await sock.sendMessage(botJid, { image: { url: pfpUrl }, caption: caption });
          } else {
            await sock.sendMessage(botJid, { text: caption });
          }
        } catch (err) {
          console.log('Self DM failed:', err.message);
        }
      }
      if (connection === 'close') {
        global.isConnected = false;
        global.connectionStatus = '⚠️ NOT LINKED - Open dashboard to pair';
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode === DisconnectReason.loggedOut) {
          console.log(chalk.red('❌ Logged out - delete auth folder'));
          try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {}
        } else {
          setTimeout(() => initBaileys(), 3000);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      const m = messages[0];
      if (!m?.message) return;
      if (m.key.remoteJid === 'status@broadcast') return;
      const msg = m.message;
      const text = msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '';
      if (!text) return;
      const prefix = config.prefix || '.';
      if (!text.trim().startsWith(prefix)) return;
      const args = text.trim().slice(prefix.length).trim().split(/ +/);
      const cmdName = args.shift()?.toLowerCase();
      if (!cmdName) return;
      const essential = ['ping','alive','owner','menu','help'];
      if(!essential.includes(cmdName)){
        if(controlSettings.disabledCmds.includes('*all*')) return;
        if(controlSettings.disabledCmds.includes(cmdName)) return;
        const cat = getCategory(cmdName);
        if(cat && controlSettings[cat] === false) return;
      }
      const plugin = global.plugins.get(cmdName);
      if (!plugin) return;
      try {
        const from = m.key.remoteJid;
        m.body = text;
        m.text = text;
        m.sender = m.key.participant || from;
        m.chat = from;
        m.fromMe = m.key.fromMe;
        m.reply = async (txt) => {
          return await sock.sendMessage(from, { text: txt }, { quoted: m });
        };
        console.log(chalk.green(`▶️ CMD ${cmdName} from ${m.key.fromMe ? 'ME' : 'OTHER'}`));
        await plugin.execute(m, { 
          sock, 
          prefix, 
          args, 
          command: cmdName, 
          config, 
          plugins: global.plugins, 
          from: from 
        });
      } catch (e) {
        console.log(chalk.red(`❌ Exec error ${cmdName}: ${e.message}`));
        console.log(e.stack);
      }
    });
  }
  await initBaileys();
}
module.exports = { startConnection };

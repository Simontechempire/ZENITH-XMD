const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  downloadMediaMessage
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const fs = require('fs');

// ⚡ BOOST
let renderBoost;
try { renderBoost = require('./renderBoost'); } catch { renderBoost = null; }

let config;
try { config = require('../settings'); } catch {
  config = { botName: "ZENITH-XMD", ownerName: "ZENITH", ownerNumber: "2348071569915", prefix: ".", sessionName: "auth", PORT: process.env.PORT || 10000 };
}
global.sock = null; global.isConnected = false; global.connectionStatus = '⚠️ NOT LINKED'; global.pairingCode = null; global.currentPairingNumber = null; global.lastPairTime = 0; global.appStarted = false;

global.db = global.db || {};
global.db.groups = global.db.groups || {};
global.db.settings = global.db.settings || { prefix: config.prefix, mode: "public", autoread: false, autostatus: false, autovv: false, autolike: false, autoreact: false, autotyping: false, autopresence: false, autoreply: false, anticall: true };
global.db.banned = global.db.banned || [];
global.db.warnings = global.db.warnings || {};
global.db.messages = global.db.messages || {};
global.db.spam = global.db.spam || {};
global.db.newDM = global.db.newDM || {};
global.db.sudo = global.db.sudo || [config.ownerNumber + '@s.whatsapp.net'];

function getGroup(jid){
  global.db.groups[jid] = global.db.groups[jid] || {
    antilink: false, antibot: false, antispam: false, antiflood: false, antivirtex: false, antibug: false, antidelete: false, antiviewonce: false, antisticker: false, antibadword: false, antiimage: false, antivideo: false, antidocument: false, antivoice: false, antipromote: false, antidemote: false, antiadd: false, welcome: false, goodbye: false, welcomeText: "", goodbyeText: ""
  };
  return global.db.groups[jid];
}

const controlFile = path.join(__dirname, '../control.json');
let controlSettings = { OWNER: true, BOT: true, GROUP: true, AI: true, DOWNLOADER: true, AUDIO: true, CONVERTER: true, LOGO: true, TOOLS: true, GAMES: true, FUN: true, PIES: true, PREMIUM: true, disabledCmds: [] };
try {
  if (fs.existsSync(controlFile)) {
    const data = JSON.parse(fs.readFileSync(controlFile, 'utf8'));
    if(data.disabledCmds && data.disabledCmds.includes('*all*')){ controlSettings.disabledCmds = []; fs.writeFileSync(controlFile, JSON.stringify(controlSettings, null, 2)); } else { controlSettings = data; }
  }
} catch(e){}
global.controlSettings = controlSettings;

const CATEGORY_MAP = {
  OWNER: ['mode','settings','password','setprefix','delprefix','setpp','setbotbio','autobio','autostatus','autotyping','autorecording','autoreact','anticall','antidelete','antiviewonce','addsudo','delsudo','sudolist','block','unblock','ban','unban','save','schedulestatus','chatbot','clearsession','cleartmp','pair','checkidch','setbotname','setowner','setownername','setprefix','settings','autovv','autoread','autolike','autoreply','autoai','autopresence'],
  BOT: ['owner','ping','alive','runtime','repo','menu','help','allmenu','uptime','speed','speedtest','list','commands'],
  GROUP: ['add','kick','kickall','promote','demote','mute','unmute','lockgroup','unlockgroup','lock','unlock','open','close','revoke','grouplink','setname','setdesc','setgcpp','gcstatus','creategc','leavegc','groupinfo','ginfo','staff','jid','tagall','tag','hidetag','tagadmins','online','welcome','goodbye','rules','poll','antilink','antibot','antispam','antiviewonce','antidelete','antisticker','antibadword','slowmode','warn','warnings','members','admins','gc','gclink','setppgc','gcpp','setwelcome','setgoodbye','antilink2','antigroup','checkadmin','botadmin','setppgroup'],
  AI: ['ai','gpt','gpt4','gemini','imagine','flux','dalle','txt2video','sora','imageedit','blackbox','llama','mistral','bot','zenithai'],
  DOWNLOADER: ['play','song','music','ytmp3','mp3','ytmp4','video','instagram','tiktok','tt','facebook','fb','pinterest','anime','gitclone','apk','pixabay','gif','tourl','yt','ig','tik'],
  AUDIO: ['bass','deep','blown','earrape','fast','slow','fat','squirrel','nightcore','robot','areverse','tomp3','tts'],
  CONVERTER: ['sticker','s','simage','toimg','removebg','upscale','take','attp','qc','emojimix','tgsticker','blur','meme','getpp','wasted','character','tovideo','toaudio'],
  LOGO: ['fancy','gfx','gfx2','gfx3','gfx4','gfx5','gfx6','gfx7','gfx8','gfx9','gfx10','gfx11','gfx12','metallic','ice','snow','impressive','matrix','neon','light','devil','purple','thunder','leaves','1917','arena','hacker','sand','blackpink','glitch','fire'],
  TOOLS: ['ss','ssweb','translate','tr','qrcode','qr','shorturl','urlshortener','calculator','calc','hash','base64','binary','encrypt','decrypt','timestamp','currency','crypto','weather','news','livescore','reminder','lyrics','count','reverse','case','palindrome','age','vv','vv2','vv3','delete','savecontact','device','netflix','tourl','fancy','emojimix','readqr','pastebin','getpic','sticker','autovv'],
  GAMES: ['trivia','scramble','wordle','hangman','guess','ttt','tictactoe','wyr','rps','slots','truth','dare','riddle','8ball','dice','coin','random','pick'],
  FUN: ['joke','fact','quote','compliment','insult','roast','flirt','ship','simp','stupid','shayari','goodnight','roseday','iloveyou'],
  PIES: ['pies','india','china','japan','korea','thai','malaysia'],
  PREMIUM: ['premium','setbotpp','autoreply','away','schedule','filter','persona','ghost']
};
function getCategory(cmd){ cmd = cmd.toLowerCase(); for(const [cat, cmds] of Object.entries(CATEGORY_MAP)){ if(cmds.includes(cmd)) return cat; } return null; }

global.plugins = new Map();
function loadPlugins() {
  const pluginsPath = path.join(__dirname, '../plugins');
  if (!fs.existsSync(pluginsPath)) { console.log(chalk.red('❌ plugins folder not found')); return; }
  global.plugins.clear(); let totalCmds = 0; let fileCount = 0;
  function readDir(dir) { const items = fs.readdirSync(dir); for (const item of items) { const fullPath = path.join(dir, item); const stat = fs.statSync(fullPath); if (stat.isDirectory()) { readDir(fullPath); } else if (item.endsWith('.js')) { fileCount++; try { delete require.cache[require.resolve(fullPath)]; const pluginData = require(fullPath); const pluginsArray = Array.isArray(pluginData) ? pluginData : [pluginData]; for (const plugin of pluginsArray) { if (plugin && plugin.name && plugin.execute) { global.plugins.set(plugin.name.toLowerCase(), plugin); if (plugin.alias && Array.isArray(plugin.alias)) { for (const a of plugin.alias) global.plugins.set(a.toLowerCase(), plugin); } totalCmds++; } } } catch (e) { console.log(chalk.red(`❌ Error loading ${item}: ${e.message}`)); } } } }
  readDir(pluginsPath); console.log(chalk.green.bold(`\n✅ WIRED ${totalCmds} cmds from ${fileCount} files\n`));
}
loadPlugins();

// ⚡ CACHE groupMetadata to avoid delay
const groupCache = new Map();
async function getGroupMeta(sock, jid){
  if(groupCache.has(jid)){
    const c = groupCache.get(jid);
    if(Date.now() - c.time < 60000) return c.meta;
  }
  try{
    const meta = await sock.groupMetadata(jid);
    groupCache.set(jid, { meta, time: Date.now() });
    return meta;
  }catch{ return null; }
}

async function startConnection() {
  if (!global.appStarted) {
    const app = express(); app.use(express.json({ limit: '10mb' })); app.use(express.urlencoded({ extended: true })); app.use(express.static(path.join(__dirname, '../public')));
    app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });
    app.get('/health', (req, res) => res.send('ZENITH-XMD LIVE'));
    app.get('/api/status', (req, res) => { res.json({ botName: "ZENITH-XMD", status: global.connectionStatus, isConnected: global.isConnected, pairingCode: global.pairingCode, plugins: global.plugins.size }); });
    app.post('/api/pair', async (req, res) => {
      try {
        let phone = (req.body.phone || '').toString().replace(/[^0-9]/g, ''); if (!phone || phone.length < 10) return res.json({ success: false, message: 'Enter valid number' });
        if (!global.sock) return res.json({ success: false, message: 'Bot starting... wait 5 sec' }); if (global.isConnected) return res.json({ success: false, message: 'Already linked!' });
        global.lastPairTime = Date.now(); global.pairingCode = null; const code = await global.sock.requestPairingCode(phone); global.pairingCode = code; global.currentPairingNumber = phone; global.connectionStatus = `🔑 CODE: ${code}`; console.log(chalk.yellow.bold(`🔑 CODE ${phone}: ${code}`)); res.json({ success: true, code, phone });
      } catch (err) { res.json({ success: false, message: err.message }); }
    });
    app.post('/api/logout', async (req, res) => { try { if (global.sock) await global.sock.logout(); } catch {} try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {} global.sock = null; global.isConnected = false; global.pairingCode = null; global.connectionStatus = '⚠️ NOT LINKED'; res.json({ success: true }); setTimeout(() => initBaileys(), 2000); });
    const PORT = config.PORT || process.env.PORT || 10000; app.listen(PORT, '0.0.0.0', () => { console.log(chalk.cyan.bold(`\n🌐 DASHBOARD LIVE ON ${PORT}\n`)); });
    global.appStarted = true;
  }

  async function initBaileys() {
    try {
      const authPath = `./${config.sessionName}`;
      if ((!fs.existsSync(authPath) || fs.readdirSync(authPath).length === 0) && process.env.SESSION_DATA) {
        fs.mkdirSync(authPath, { recursive: true }); let data; try { data = JSON.parse(process.env.SESSION_DATA); } catch { const buff = Buffer.from(process.env.SESSION_DATA, 'base64'); data = JSON.parse(buff.toString()); } fs.writeFileSync(path.join(authPath, 'creds.json'), JSON.stringify(data, null, 2));
      }
    } catch(e){}
    const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionName}`); const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ 
      version, 
      logger: pino({ level: 'silent' }), 
      printQRInTerminal: false, 
      browser: Browsers.macOS('Safari'), 
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })), }, 
      markOnlineOnConnect: false, // ⚡ FASTER
      connectTimeoutMs: 60000, 
      keepAliveIntervalMs: 30000, 
      retryRequestDelayMs: 1000,
      defaultQueryTimeoutMs: 0,
      emitOwnEvents: false,
    });
    global.sock = sock; sock.ev.on('creds.update', saveCreds);

    sock.ev.on('call', async(calls)=>{
      for(let call of calls){ if(global.db.settings.anticall) await sock.rejectCall(call.id, call.from).catch(()=>{}); }
    });

    sock.ev.on('messages.update', async(updates)=>{
      for(let up of updates){
        if(up.update.message === null){
          const saved = global.db.messages[up.key.id];
          if(!saved) continue;
          const g = getGroup(saved.from);
          if(!g.antidelete) continue;
          try{ await sock.sendMessage(saved.from, { text: `*🔍 ANTIDELETE*\nFrom: @${saved.sender.split('@')[0]}\n> ${saved.text?.slice(0,400)}`, mentions:[saved.sender] }); }catch{}
        }
      }
    });

    sock.ev.on('group-participants.update', async(update)=>{
      const { id, participants, action } = update;
      const g = getGroup(id);
      try{
        if(action==='add' && g.welcome){ for(let p of participants) await sock.sendMessage(id, { text: (g.welcomeText||`Welcome @user`).replace(/@user/g,'@'+p.split('@')[0]), mentions:[p] }); }
        if(action==='remove' && g.goodbye){ for(let p of participants) await sock.sendMessage(id, { text: (g.goodbyeText||`Goodbye @${p.split('@')[0]} 👋`), mentions:[p] }); }
      }catch{}
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'connecting') global.connectionStatus = 'Connecting...';
      if (connection === 'open') {
        global.isConnected = true; global.connectionStatus = 'ONLINE ✅'; global.pairingCode = null; console.log(chalk.green.bold(`\n✅ ONLINE! ${global.plugins.size} CMDS\n`)); loadPlugins();
        try {
          const botJid = sock.user.id; const caption = `✅ ZENITH-XMD LINKED\nPrefix: ${config.prefix}\n${global.plugins.size} CMDS\n.mune → menu`;
          await sock.sendMessage(botJid, { text: caption }).catch(()=>{});
        } catch (err) {}
      }
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode; global.isConnected = false; global.sock = null;
        if (statusCode === DisconnectReason.loggedOut) { try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {} global.connectionStatus = 'LOGGED OUT'; setTimeout(() => initBaileys(), 3000); }
        else if ([401,440,405].includes(statusCode)) { try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {} setTimeout(() => initBaileys(), 3000); }
        else { setTimeout(() => initBaileys(), 5000); }
      }
    });

    // ===== ⚡ FAST MESSAGE HANDLER =====
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return; 
      const m = messages[0]; if (!m?.message) return;
      const from = m.key.remoteJid;

      if (from === 'status@broadcast') return; // ⚡ SKIP STATUS COMPLETELY - biggest speed gain

      const sender = m.key.participant || from;
      const isGroup = from.endsWith('@g.us');
      const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
      const mtype = Object.keys(m.message)[0];

      if(m.key.id) {
        global.db.messages[m.key.id] = { text: body, sender, from, time: Date.now() };
        // clean old
        if(Object.keys(global.db.messages).length > 100){
          const first = Object.keys(global.db.messages)[0];
          delete global.db.messages[first];
        }
      }

      // ⚡ ONLY autoread if enabled - don't waste time
      if(global.db.settings.autoread) sock.readMessages([m.key]).catch(()=>{});

      // ===== QUICK ANTI CHECK (only if group) =====
      if(isGroup && body){
        const g = getGroup(from);
        if((g.antilink || g.antibot || g.antisticker) && !m.key.fromMe){
          // fast check without metadata if possible
          if(g.antilink && /(https?:\/\/|chat\.whatsapp\.com|wa\.me)/i.test(body)){
            sock.sendMessage(from, { delete: m.key }).catch(()=>{});
          }
        }
      }

      if (!body) return;
      const prefix = global.db.settings.prefix || config.prefix || '.'; 
      if (!body.trim().startsWith(prefix)) return;
      const args = body.trim().slice(prefix.length).trim().split(/ +/); 
      const cmdName = args.shift()?.toLowerCase(); 
      if (!cmdName) return;

      // Control check
      if(!['ping','alive','owner','menu','help'].includes(cmdName)){
        if(controlSettings.disabledCmds.includes(cmdName)) return;
        const cat = getCategory(cmdName); if(cat && controlSettings[cat] === false) return;
      }

      const plugin = global.plugins.get(cmdName); if (!plugin) return;
      if(global.db.banned.includes(sender)) return;

      try {
        const chat = from;
        m.body = body; m.text = body; m.args = args; m.sender = sender; m.chat = chat; m.from = from; m.isGroup = isGroup; m.fromMe = m.key.fromMe;
        m.pushName = m.pushName || "User";
        m.mentionedJid = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        m.isOwner = sender===config.ownerNumber+'@s.whatsapp.net' || global.db.sudo.includes(sender);
        m.download = async()=> await downloadMediaMessage(m, 'buffer', {}, { logger: pino({level:"silent"}), reuploadRequest: sock.updateMediaMessage });
        m.quoted = (() => {
          const ctx = m.message.extendedTextMessage?.contextInfo;
          if(!ctx?.quotedMessage) return null;
          return {
            message: ctx.quotedMessage,
            sender: ctx.participant,
            mtype: Object.keys(ctx.quotedMessage)[0],
            download: async()=> await downloadMediaMessage({message: ctx.quotedMessage}, 'buffer', {}, { logger: pino({level:"silent"}), reuploadRequest: sock.updateMediaMessage })
          };
        })();
        if(isGroup){
          // use cache
          const meta = await getGroupMeta(sock, from);
          if(meta){
            const part = meta.participants.find(p=>p.id===sender);
            m.isGroupAdmin = !!part?.admin;
            m.isBotAdmin = !!meta.participants.find(p=> p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net' || p.id===sock.user.id)?.admin;
          }
        }
        m.reply = async (txt) => { return await sock.sendMessage(from, { text: txt }, { quoted: m }); };
        console.log(chalk.green(`▶️ ${cmdName} from ${sender.split('@')[0]}`));
        await plugin.execute(m, { sock, prefix, args, command: cmdName, config, plugins: global.plugins, from, sender, getGroup });
      } catch (e) { console.log(chalk.red(`❌ ${cmdName}: ${e.message}`)); }
    });
  }
  await initBaileys();
}
module.exports = { startConnection };

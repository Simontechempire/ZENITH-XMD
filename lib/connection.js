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

let config;
try { config = require('../settings'); } catch {
  config = { botName: "ZENITH-XMD", ownerName: "ZENITH", ownerNumber: "2348071569915", prefix: ".", sessionName: "auth", PORT: process.env.PORT || 10000 };
}
global.sock = null; global.isConnected = false; global.connectionStatus = '⚠️ NOT LINKED - Go to Dashboard to Pair'; global.pairingCode = null; global.currentPairingNumber = null; global.lastPairTime = 0; global.appStarted = false;

// ===== PEAK DB =====
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
    if(data.disabledCmds && data.disabledCmds.includes('*all*')){ console.log(chalk.yellow('⚠️ control.json locked - Auto reset to ON')); controlSettings.disabledCmds = []; fs.writeFileSync(controlFile, JSON.stringify(controlSettings, null, 2)); } else { controlSettings = data; }
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
  readDir(pluginsPath); console.log(chalk.green.bold(`\n✅ WIRED ${totalCmds} cmds from ${fileCount} files | VV+Owner+Group+Mod+Auto+Anti+AI+Tools ✅\n`));
}
loadPlugins();

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
        global.lastPairTime = Date.now(); global.pairingCode = null; const code = await global.sock.requestPairingCode(phone); global.pairingCode = code; global.currentPairingNumber = phone; global.connectionStatus = `🔑 CODE: ${code} - Link in WhatsApp`; console.log(chalk.yellow.bold(`🔑 NEW PAIR CODE FOR ${phone}: ${code}`)); res.json({ success: true, code, phone });
      } catch (err) { console.log('Pair error:', err.message); global.pairingCode = null; res.json({ success: false, message: err.message }); }
    });
    app.post('/api/logout', async (req, res) => { try { if (global.sock) await global.sock.logout(); } catch {} try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {} global.sock = null; global.isConnected = false; global.pairingCode = null; global.connectionStatus = '⚠️ NOT LINKED - Go to Dashboard to Pair'; res.json({ success: true }); setTimeout(() => initBaileys(), 2000); });
    const PORT = config.PORT || process.env.PORT || 10000; app.listen(PORT, '0.0.0.0', () => { console.log(chalk.cyan.bold(`\n🌐 ZENITH DASHBOARD LIVE ON ${PORT}\n`)); });
    setInterval(() => { if(global.sock && global.isConnected){ try { global.sock.sendPresenceUpdate('available'); } catch {} } }, 25 * 60 * 1000);
    global.appStarted = true;
  }

  async function initBaileys() {
    try {
      const authPath = `./${config.sessionName}`;
      if ((!fs.existsSync(authPath) || fs.readdirSync(authPath).length === 0) && process.env.SESSION_DATA) {
        console.log(chalk.yellow('♻️ Restoring session from ENV...')); fs.mkdirSync(authPath, { recursive: true }); let data; try { data = JSON.parse(process.env.SESSION_DATA); } catch { const buff = Buffer.from(process.env.SESSION_DATA, 'base64'); data = JSON.parse(buff.toString()); } fs.writeFileSync(path.join(authPath, 'creds.json'), JSON.stringify(data, null, 2)); console.log(chalk.green('✅ Session restored!'));
      }
    } catch(e){ console.log('Restore fail:', e.message) }
    const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionName}`); const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), printQRInTerminal: false, browser: Browsers.macOS('Safari'), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })), }, markOnlineOnConnect: true, connectTimeoutMs: 60000, keepAliveIntervalMs: 10000, retryRequestDelayMs: 2000, });
    global.sock = sock; sock.ev.on('creds.update', async () => { await saveCreds(); });

    // ===== ANTI CALL =====
    sock.ev.on('call', async(calls)=>{
      for(let call of calls){ if(global.db.settings.anticall || getGroup(call.chatId)?.anticall) await sock.rejectCall(call.id, call.from).catch(()=>{}); }
    });

    // ===== ANTIDELETE ENGINE =====
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

    // ===== WELCOME / GOODBYE / ANTI PROMOTE/DEMOTE =====
    sock.ev.on('group-participants.update', async(update)=>{
      const { id, participants, action } = update;
      const g = getGroup(id);
      try{
        const meta = await sock.groupMetadata(id);
        const botIsAdmin = meta.participants.find(p=> p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net' || p.id===sock.user.id)?.admin;
        if(action==='add' && g.welcome){ for(let p of participants) await sock.sendMessage(id, { text: (g.welcomeText||`Welcome @user`).replace(/@user/g,'@'+p.split('@')[0]), mentions:[p] }); }
        if(action==='remove' && g.goodbye){ for(let p of participants) await sock.sendMessage(id, { text: (g.goodbyeText||`Goodbye @${p.split('@')[0]} 👋`), mentions:[p] }); }
        if(botIsAdmin){
          if(action==='promote' && g.antipromote) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"demote");
          if(action==='demote' && g.antidemote) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"promote");
          if(action==='add' && g.antiadd) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"remove");
        }
      }catch{}
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'connecting') global.connectionStatus = 'Connecting to WhatsApp...';
      if (connection === 'open') {
        global.isConnected = true; global.connectionStatus = 'ZENITH-XMD ONLINE ✅'; global.pairingCode = null; console.log(chalk.green.bold(`\n✅ ZENITH-XMD ONLINE! ${global.plugins.size} CMDS WIRED\n`)); loadPlugins();
        try {
          const botJid = sock.user.id; let userName = sock.user.name || "User"; const phoneNumber = botJid.split('@')[0];
          const platform = process.env.RAILWAY_STATIC_URL ? 'Railway' : process.env.RENDER ? 'Render' : process.env.KOYEB ? 'Koyeb' : 'Cloud';
          let pfpUrl; try { pfpUrl = await sock.profilePictureUrl(botJid, 'image'); } catch { pfpUrl = null; }
          const caption = `╭━━━〔 ⚡ ᴢᴇɴɪᴛʜ xᴍᴅ 〕━━━╮\n┃    ✅ ʟɪɴᴋ sᴜᴄᴄᴇssғᴜʟ\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👋 ${userName} | 📱 ${phoneNumber}\n🔣 Prefix: ${config.prefix} | ☁️ ${platform}\n⚡ ${global.plugins.size} CMDS WIRED\n\n.mune → menu\n.ping → speed`;
          if (pfpUrl) { await sock.sendMessage(botJid, { image: { url: pfpUrl }, caption }); } else { await sock.sendMessage(botJid, { text: caption }); }
        } catch (err) {}
      }
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode; console.log(chalk.red(`❌ Closed: ${statusCode}`));
        global.isConnected = false; global.sock = null;
        if (statusCode === DisconnectReason.loggedOut) { try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {} global.connectionStatus = '⚠️ LOGGED OUT'; setTimeout(() => initBaileys(), 3000); }
        else if ([401,440,405].includes(statusCode)) { try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {} global.connectionStatus = '⚠️ SESSION INVALID'; setTimeout(() => initBaileys(), 3000); }
        else { global.connectionStatus = '⚠️ Reconnecting...'; setTimeout(() => initBaileys(), 5000); }
      }
    });

    // ===== PEAK MESSAGE HANDLER =====
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return; const m = messages[0]; if (!m?.message) return;
      const from = m.key.remoteJid;

      // STATUS - AUTOSTATUS
      if (from === 'status@broadcast'){
        if(global.db.settings.autostatus){ await sock.readMessages([m.key]).catch(()=>{}); if(global.db.settings.autolike || global.db.settings.autoreact) await sock.sendMessage(from, { react: { text:"❤️", key: m.key } }).catch(()=>{}); }
        return;
      }

      const sender = m.key.participant || from;
      const isGroup = from.endsWith('@g.us');
      const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
      const mtype = Object.keys(m.message)[0];

      // SAVE FOR ANTIDELETE
      if(m.key.id) global.db.messages[m.key.id] = { text: body, sender, from, time: Date.now() };

      // ===== AUTO ENGINE =====
      if(global.db.settings.autoread) await sock.readMessages([m.key]).catch(()=>{});
      if(global.db.settings.autotyping) await sock.sendPresenceUpdate('composing', from).catch(()=>{});
      if(global.db.settings.autorecording) await sock.sendPresenceUpdate('recording', from).catch(()=>{});
      if(global.db.settings.autopresence) await sock.sendPresenceUpdate('available', from).catch(()=>{});
      if(global.db.settings.autoreact) await sock.sendMessage(from, { react: { text:"✅", key: m.key } }).catch(()=>{});

      // AUTO REPLY HEY TO NEW DM ONLY
      if(!isGroup && global.db.settings.autoreply){
        if(!global.db.newDM[sender]){ global.db.newDM[sender]=true; await sock.sendMessage(from, { text:"Hey 👋 Welcome to ZENITH-XMD PEAK\nHow can I help you?" }, { quoted: m }); return; }
      }

      // ===== ANTI ENGINE + AUTOVV =====
      if(isGroup){
        const g = getGroup(from);
        // AUTOVV
        if((global.db.settings.autovv || g.antiviewonce) && (m.message.viewOnceMessage || m.message.viewOnceMessageV2 || m.message.viewOnceMessageV2Extension)){
          try{ const q = m.message.viewOnceMessage || m.message.viewOnceMessageV2 || m.message.viewOnceMessageV2Extension; await sock.sendMessage(from, { text: `*👁️ AUTOVV UNLOCKED*` }); await sock.sendMessage(from, { forward: q }, { quoted: m }).catch(async()=>{
            // fallback extract
            const inner = q?.message || q;
            if(inner?.imageMessage) await sock.sendMessage(from, { image: inner.imageMessage }, { quoted: m });
            if(inner?.videoMessage) await sock.sendMessage(from, { video: inner.videoMessage }, { quoted: m });
          }); }catch(e){ console.log("VV fail", e.message); }
        }

        try{
          const meta = await sock.groupMetadata(from).catch(()=>null);
          if(meta){
            const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net';
            const botIsAdmin = meta.participants.find(p=> p.id===botId || p.id===sock.user.id)?.admin;
            const user = meta.participants.find(p=> p.id===sender);
            const isAdmin = user?.admin;
            const isOwner = sender===config.ownerNumber+'@s.whatsapp.net' || global.db.sudo.includes(sender);
            if(!isAdmin && !isOwner && botIsAdmin){
              if(g.antilink && /(https?:\/\/|chat\.whatsapp\.com|wa\.me|t\.me|www\.)/i.test(body)){ await sock.sendMessage(from, { delete: m.key }).catch(()=>{}); }
              if(g.antibot && m.key.id.startsWith('BAE5')) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antisticker && mtype==='stickerMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antiimage && mtype==='imageMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antivideo && mtype==='videoMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antidocument && mtype==='documentMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antibadword && /(fuck|shit|porn|xxx)/i.test(body)) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antispam || g.antiflood){
                const key = `${from}_${sender}`; global.db.spam[key] = global.db.spam[key] || {count:0,last:0};
                if(Date.now()-global.db.spam[key].last < 3000) global.db.spam[key].count++; else global.db.spam[key].count=1;
                global.db.spam[key].last=Date.now();
                if(global.db.spam[key].count>=5){ await sock.groupParticipantsUpdate(from,[sender],"remove").catch(()=>{}); global.db.spam[key].count=0; }
              }
              if((g.antivirtex || g.antibug) && body.length>3500){ await sock.sendMessage(from,{delete:m.key}).catch(()=>{}); await sock.groupParticipantsUpdate(from,[sender],"remove").catch(()=>{}); }
            }
          }
        }catch(e){}
      }

      // ===== COMMAND CHECK =====
      if (!body) return;
      const prefix = global.db.settings.prefix || config.prefix || '.'; if (!body.trim().startsWith(prefix)) return;
      const args = body.trim().slice(prefix.length).trim().split(/ +/); const cmdName = args.shift()?.toLowerCase(); if (!cmdName) return;
      const essential = ['ping','alive','owner','menu','help','allmenu']; if(!essential.includes(cmdName)){ if(controlSettings.disabledCmds.includes('*all*')) return; if(controlSettings.disabledCmds.includes(cmdName)) return; const cat = getCategory(cmdName); if(cat && controlSettings[cat] === false) return; }
      const plugin = global.plugins.get(cmdName); if (!plugin) return;
      if(global.db.banned.includes(sender)) return;

      try {
        const chat = from;
        m.body = body; m.text = body; m.args = args; m.sender = sender; m.chat = chat; m.from = from; m.isGroup = isGroup; m.fromMe = m.key.fromMe;
        m.pushName = m.pushName || "User";
        m.mentionedJid = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        m.isOwner = sender===config.ownerNumber+'@s.whatsapp.net' || global.db.sudo.includes(sender);
        // DOWNLOAD + QUOTED
        m.download = async()=> await downloadMediaMessage(m, 'buffer', {}, { logger: pino({level:"silent"}), reuploadRequest: sock.updateMediaMessage });
        m.quoted = (() => {
          const ctx = m.message.extendedTextMessage?.contextInfo;
          if(!ctx?.quotedMessage) return null;
          return {
            message: ctx.quotedMessage,
            sender: ctx.participant,
            mtype: Object.keys(ctx.quotedMessage)[0],
            mimetype: ctx.quotedMessage[Object.keys(ctx.quotedMessage)[0]]?.mimetype || "",
            download: async()=> await downloadMediaMessage({message: ctx.quotedMessage}, 'buffer', {}, { logger: pino({level:"silent"}), reuploadRequest: sock.updateMediaMessage })
          };
        })();
        // FIX FOR .open/.close - CHECK BOT ADMIN
        if(isGroup){
          try{
            const meta = await sock.groupMetadata(from);
            const part = meta.participants.find(p=>p.id===sender);
            m.isGroupAdmin = !!part?.admin;
            m.isAdmin = m.isGroupAdmin;
            m.isBotAdmin = !!meta.participants.find(p=> p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net' || p.id===sock.user.id)?.admin;
            if((cmdName==='open' || cmdName==='close' || cmdName==='lockgroup' || cmdName==='unlockgroup' || cmdName==='lock' || cmdName==='unlock') && !m.isBotAdmin){
              return await sock.sendMessage(from, { text: "🤖 Make bot admin first!" }, { quoted: m });
            }
            if((cmdName==='open' || cmdName==='close') && !m.isGroupAdmin && !m.isOwner){
              return await sock.sendMessage(from, { text: "⛔ Only group admin are authorised to use this commands" }, { quoted: m });
            }
          }catch{ m.isGroupAdmin = false; m.isBotAdmin = false; }
        }
        m.reply = async (txt) => { return await sock.sendMessage(from, { text: txt }, { quoted: m }); };
        console.log(chalk.green(`▶️ CMD ${cmdName} from ${sender.split('@')[0]}`));
        await plugin.execute(m, { sock, prefix, args, command: cmdName, config, plugins: global.plugins, from, sender, getGroup });
      } catch (e) { console.log(chalk.red(`❌ Exec error ${cmdName}: ${e.message}`)); await sock.sendMessage(from, { text:`❌ Error in ${cmdName}: ${e.message}` }, { quoted: m }).catch(()=>{}); }
    });
  }
  await initBaileys();
}
module.exports = { startConnection };

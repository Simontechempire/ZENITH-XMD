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
const autoPlugin = require('../plugins/auto');
const antiPlugin = require('../plugins/anti');

let config;
try { config = require('../settings'); } catch {
  config = { botName: "ZENITH-XMD", ownerName: "ZENITH", ownerNumber: "2348071569915", prefix: ".", sessionName: "auth", PORT: process.env.PORT || 10000 };
}
const PAIR_NUMBER = (process.env.PHONE_NUMBER || process.env.PAIR_NUMBER || config.ownerNumber || "2348071569915").replace(/[^0-9]/g,'');

global.sock = null; global.isConnected = false; global.connectionStatus = '⚠️ NOT LINKED'; global.pairingCode = null; global.currentPairingNumber = null; global.lastPairTime = 0; global.appStarted = false;
global.db = global.db || {};
global.db.settings = global.db.settings || { prefix: config.prefix, mode: "public", autoread: true, autostatus: true, autovv: true, autolike: true, autoreact: true, autotyping: true, autopresence: true, autoreply: true, anticall: true, antidelete: true, antiviewonce: true };
global.db.groups = global.db.groups || {};
global.db.banned = global.db.banned || [];
global.db.sudo = global.db.sudo || [];
global.db.messages = global.db.messages || {};
global.db.warnings = global.db.warnings || {};
global.db.spam = global.db.spam || {};
global.db.newDM = global.db.newDM || {};
global.db.xp = global.db.xp || {};

function getGroup(jid){
  global.db.groups[jid] = global.db.groups[jid] || {
    antilink:false, antibot:false, antiforeign:false, antispam:false,
    antivirtex:false, antidelete:false, antiviewonce:false, antisticker:false,
    anticall:false, antifake:false, antilink2:false, antibadword:false,
    antiporn:false, antitag:false, antidemote:false, antipromote:false,
    antidocument:false, antiaudio:false, antivideo:false, antiimage:false,
    antilocation:false, anticontact:false, antivoice:false, antistatus:false,
    antibug:false, antilink3:false, antiwame:false, antigroup:false,
    antichannel:false, antiflood:false, antimention:false, antidelete2:false,
    antiedit:false, antipin:false, antiunpin:false, antikick:false,
    antiadd:false, antirevoke:false, antibutton:false, antilist:false, antipoll:false,
    antigmention:false, antigmentionMode:'warndelete',
    antigcstatus:false, antigcstatusMode:'warndelete',
    welcome:false, goodbye:false, welcomeText:"", goodbyeText:""
  };
  // Backfill old groups
  const g = global.db.groups[jid];
  if(g.antigmention===undefined) g.antigmention=false;
  if(g.antigmentionMode===undefined) g.antigmentionMode='warndelete';
  if(g.antigcstatus===undefined) g.antigcstatus=false;
  if(g.antigcstatusMode===undefined) g.antigcstatusMode='warndelete';
  return g;
}

const controlFile = path.join(__dirname, '../control.json');
let controlSettings = { OWNER:true,BOT:true,GROUP:true,AI:true,DOWNLOADER:true,AUDIO:true,CONVERTER:true,LOGO:true,TOOLS:true,GAMES:true,FUN:true,PIES:true,PREMIUM:true,disabledCmds:[] };
try{ if(fs.existsSync(controlFile)){ const d=JSON.parse(fs.readFileSync(controlFile,'utf8')); if(!(d.disabledCmds&&d.disabledCmds.includes('*all*'))) controlSettings=d; } }catch{}
global.controlSettings=controlSettings;

const CATEGORY_MAP={
  OWNER:['mode','settings','password','setprefix','delprefix','setpp','setbotbio','autobio','autostatus','autotyping','autorecording','autoreact','anticall','antidelete','antiviewonce','addsudo','delsudo','sudolist','block','unblock','ban','unban','save','schedulestatus','chatbot','clearsession','cleartmp','pair','checkidch','setbotname','setowner','setownername','settings','autovv','autoread','autolike','autoreply','autoai','autopresence'],
  BOT:['owner','ping','alive','runtime','repo','menu','help','allmenu','uptime','speed','speedtest','list','commands'],
  GROUP:['add','kick','kickall','promote','demote','mute','unmute','lockgroup','unlockgroup','lock','unlock','open','close','revoke','grouplink','setname','setdesc','setgcpp','gcstatus','creategc','leavegc','groupinfo','ginfo','staff','jid','tagall','tag','hidetag','tagadmins','online','welcome','goodbye','rules','poll','antilink','antibot','antispam','antiviewonce','antidelete','antisticker','antibadword','slowmode','warn','warnings','members','admins','gc','gclink','setppgc','gcpp','setwelcome','setgoodbye','antilink2','antigroup','checkadmin','botadmin','setppgroup','antigmention','antigcstatus','antistatuslist'],
  AI:['ai','gpt','gpt4','gemini','imagine','flux','dalle','txt2video','sora','imageedit','blackbox','llama','mistral','bot','zenithai'],
  DOWNLOADER:['play','song','music','ytmp3','mp3','ytmp4','video','instagram','tiktok','tt','facebook','fb','pinterest','anime','gitclone','apk','pixabay','gif','tourl','yt','ig','tik'],
  AUDIO:['bass','deep','blown','earrape','fast','slow','fat','squirrel','nightcore','robot','areverse','tomp3','tts'],
  CONVERTER:['sticker','s','simage','toimg','removebg','upscale','take','attp','qc','emojimix','tgsticker','blur','meme','getpp','wasted','character','tovideo','toaudio'],
  LOGO:['fancy','gfx','gfx2','gfx3','gfx4','gfx5','gfx6','gfx7','gfx8','gfx9','gfx10','gfx11','gfx12','metallic','ice','snow','impressive','matrix','neon','light','devil','purple','thunder','leaves','1917','arena','hacker','sand','blackpink','glitch','fire'],
  TOOLS:['ss','ssweb','translate','tr','qrcode','qr','shorturl','urlshortener','calculator','calc','hash','base64','binary','encrypt','decrypt','timestamp','currency','crypto','weather','news','livescore','reminder','lyrics','count','reverse','case','palindrome','age','vv','vv2','vv3','delete','savecontact','device','netflix','tourl','fancy','emojimix','readqr','pastebin','getpic','sticker','autovv','vvimage','vvvideo','vvaudio','vvinfo','vvstatus','vvhelp'],
  GAMES:['trivia','scramble','wordle','hangman','guess','ttt','tictactoe','wyr','rps','slots','truth','dare','riddle','8ball','dice','coin','random','pick'],
  FUN:['joke','fact','quote','compliment','insult','roast','flirt','ship','simp','stupid','shayari','goodnight','roseday','iloveyou'],
  PIES:['pies','india','china','japan','korea','thai','malaysia'],
  PREMIUM:['premium','setbotpp','autoreply','away','schedule','filter','persona','ghost']
};
function getCategory(cmd){ cmd=cmd.toLowerCase(); for(const [cat,cmds] of Object.entries(CATEGORY_MAP)){ if(cmds.includes(cmd)) return cat; } return null; }

global.plugins=new Map();
function loadPlugins(){
  const pPath=path.join(__dirname,'../plugins');
  if(!fs.existsSync(pPath)) return;
  global.plugins.clear();
  let t=0;
  function rd(dir){
    const items=fs.readdirSync(dir);
    for(const it of items){
      const full=path.join(dir,it);
      const st=fs.statSync(full);
      if(st.isDirectory()) rd(full);
      else if(it.endsWith('.js')){
        try{
          delete require.cache[require.resolve(full)];
          const d=require(full);
          // ✅ FIX: support both Array export AND {commands} export
          const arr=Array.isArray(d)?d:(d.commands||[d]);
          for(const pl of arr){
            if(pl&&pl.name&&pl.execute){
              global.plugins.set(pl.name.toLowerCase(),pl);
              if(pl.alias) for(const a of pl.alias) global.plugins.set(String(a).toLowerCase(),pl);
              t++;
            }
          }
        }catch(e){ console.log(`Load err ${it}: ${e.message}`) }
      }
    }
  }
  rd(pPath);
  console.log(chalk.green(`✅ WIRED ${t} cmds`));
}
loadPlugins();

const groupCache=new Map();
async function getCachedMeta(sock,jid){
  const c=groupCache.get(jid); if(c && Date.now()-c.time<90000) return c.meta;
  try{ const meta=await sock.groupMetadata(jid); groupCache.set(jid,{meta,time:Date.now()}); if(groupCache.size>50) groupCache.delete(groupCache.keys().next().value); return meta; }catch{ return null; }
}

async function startConnection(){
  if(!global.appStarted){
    const app=express(); app.use(express.json()); app.use(express.static(path.join(__dirname,'../public')));
    app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));
    app.get('/health',(req,res)=>res.send('LIVE'));
    app.get('/api/status',(req,res)=>res.json({ botName:"ZENITH-XMD", status:global.connectionStatus, isConnected:global.isConnected, pairingCode:global.pairingCode, plugins:global.plugins.size }));
    app.get('/pair',(req,res)=>res.json({ code:global.pairingCode, status:global.connectionStatus }));
    app.post('/api/pair',async(req,res)=>{
      try{
        let phone=(req.body.phone||PAIR_NUMBER).replace(/[^0-9]/g,''); if(phone.length<10) return res.json({success:false,message:'Enter valid number'});
        if(!global.sock) return res.json({success:false,message:'Bot starting... wait 5 sec'});
        if(global.isConnected) return res.json({success:false,message:'Already linked!'});
        const code=await global.sock.requestPairingCode(phone); global.pairingCode=code; global.connectionStatus=`CODE: ${code}`; console.log(chalk.yellow(`🔑 CODE ${phone}: ${code}`)); res.json({success:true,code});
      }catch(e){ console.log('Pair fail',e.message); res.json({success:false,message:e.message}); }
    });
    app.post('/api/logout',async(req,res)=>{ try{ if(global.sock) await global.sock.logout().catch(()=>{}); }catch{} try{ fs.rmSync(`./${config.sessionName}`,{recursive:true,force:true}); }catch{} global.sock=null; global.isConnected=false; res.json({success:true}); setTimeout(()=>initBaileys(),1000); });
    const PORT=config.PORT||process.env.PORT||10000; app.listen(PORT,'0.0.0.0',()=>console.log(chalk.cyan(`🌐 Dashboard ${PORT}`))); global.appStarted=true;
  }

  async function initBaileys(){
    try{
      const authPath=`./${config.sessionName}`;
      if((!fs.existsSync(authPath)||fs.readdirSync(authPath).length===0)&&process.env.SESSION_DATA){
        fs.mkdirSync(authPath,{recursive:true}); let d; try{ d=JSON.parse(process.env.SESSION_DATA); }catch{ d=JSON.parse(Buffer.from(process.env.SESSION_DATA,'base64').toString()); } fs.writeFileSync(path.join(authPath,'creds.json'),JSON.stringify(d,null,2));
      }
    }catch(e){}
    const {state,saveCreds}=await useMultiFileAuthState(`./${config.sessionName}`); const {version}=await fetchLatestBaileysVersion();
    const sock=makeWASocket({ version, logger:pino({level:'silent'}), printQRInTerminal:false, browser:Browsers.macOS('Chrome'), auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))}, markOnlineOnConnect:false, connectTimeoutMs:20000, keepAliveIntervalMs:10000, syncFullHistory:false, retryRequestDelayMs:1000 });
    global.sock=sock; sock.ev.on('creds.update',saveCreds);

    if(!sock.authState.creds.registered){
      setTimeout(async()=>{
        if(global.isConnected) return;
        try{
          const code = await sock.requestPairingCode(PAIR_NUMBER);
          global.pairingCode = code;
          global.connectionStatus = `CODE: ${code}`;
          console.log(chalk.yellow.bold(`\n🔑 ZENITH PAIRING CODE FOR ${PAIR_NUMBER}: ${code}\n`));
        }catch(e){
          console.log(chalk.red(`Pairing failed: ${e.message} - Retrying in 3s...`));
          setTimeout(async()=>{
            try{ const code2 = await sock.requestPairingCode(PAIR_NUMBER); global.pairingCode = code2; console.log(chalk.yellow.bold(`\n🔑 RETRY CODE: ${code2}\n`)); }catch(e2){ console.log(chalk.red('Pairing retry failed:', e2.message)) }
          },3000);
        }
      },2000);
    }

    sock.ev.on('call',async(calls)=>{ for(let c of calls){ try{ if(global.db.settings.anticall) await sock.rejectCall(c.id,c.from); }catch{} } });

    sock.ev.on('messages.update',async(updates)=>{
      for(let up of updates){
        if(up.update.message===null){
          const saved=global.db.messages[up.key.id]; if(!saved) continue;
          const g=getGroup(saved.from); if(!g.antidelete) continue;
          try{ await sock.sendMessage(saved.from,{text:`*🔍 ANTIDELETE*\nFrom: @${saved.sender.split('@')[0]}\n> ${(saved.text||'').slice(0,300)}`,mentions:[saved.sender]}); }catch{}
        }
        try{ if(antiPlugin && antiPlugin.onDelete) await antiPlugin.onDelete(sock, up); }catch{}
      }
    });

    sock.ev.on('group-participants.update',async(update)=>{
      try{
        const {id,participants,action}=update; const g=getGroup(id); const meta=await getCachedMeta(sock,id); if(!meta) return;
        const botIsAdmin=meta.participants.find(p=>p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net'||p.id===sock.user.id)?.admin;
        if(action==='add'&&g.welcome){ for(let p of participants) await sock.sendMessage(id,{text:(g.welcomeText||`Welcome @user`).replace(/@user/g,'@'+p.split('@')[0]),mentions:[p]}).catch(()=>{}); }
        if(action==='remove'&&g.goodbye){ for(let p of participants) await sock.sendMessage(id,{text:(g.goodbyeText||`Goodbye @${p.split('@')[0]}`).replace(/@user/g,'@'+p.split('@')[0]),mentions:[p]}).catch(()=>{}); }
        if(botIsAdmin){
          if(action==='promote'&&g.antipromote) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"demote").catch(()=>{});
          if(action==='demote'&&g.antidemote) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"promote").catch(()=>{});
          if(action==='add'&&g.antiadd) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"remove").catch(()=>{});
          if(action==='remove'&&g.antikick){
            // AntiKick: if someone else kicked, re-add is not possible reliably, just log
            console.log('AntiKick triggered for', participants);
          }
        }
      }catch{}
      try{ if(autoPlugin && autoPlugin.onGroupUpdate) await autoPlugin.onGroupUpdate(sock, update, getGroup); }catch{}
      try{ if(antiPlugin && antiPlugin.onGroupUpdate) await antiPlugin.onGroupUpdate(sock, update, getGroup); }catch{}
    });

    sock.ev.on('connection.update',async(update)=>{
      const {connection,lastDisconnect}=update;
      if(connection==='connecting') global.connectionStatus='Connecting...';
      if(connection==='open'){
        global.isConnected=true; global.connectionStatus='ONLINE ✅'; global.pairingCode=null; console.log(chalk.green.bold(`\n✅ ONLINE! ${global.plugins.size} CMDS\n`)); loadPlugins();
        try{ if(autoPlugin && autoPlugin.startTimers) autoPlugin.startTimers(sock); }catch{}
        try{ const jid=sock.user.id; await sock.sendMessage(jid,{text:`✅ *ZENITH-XMD LINKED*\n\n👤 ${sock.user.name||'User'}\n🔣 Prefix: ${config.prefix}\n⚡ ${global.plugins.size} CMDS\n\nType ${config.prefix}menu`}).catch(()=>{}); }catch{}
      }
      if(connection==='close'){
        const code=lastDisconnect?.error?.output?.statusCode; console.log(chalk.red(`❌ Closed ${code}`)); global.isConnected=false; global.sock=null; groupCache.clear();
        if(code===DisconnectReason.loggedOut || code===401){
          try{ fs.rmSync(`./${config.sessionName}`,{recursive:true,force:true}); }catch{}
          global.connectionStatus='LOGGED OUT - Need new pairing';
          console.log(chalk.red('Logged out - delete auth folder and restart for new code'));
          setTimeout(()=>initBaileys(),2000);
        }
        else if(code===405 || code===440){ console.log(chalk.yellow('Pairing failed (405) - will retry with fresh code in 2s')); global.pairingCode=null; setTimeout(()=>initBaileys(),2000); }
        else{ global.connectionStatus='Reconnecting...'; setTimeout(()=>initBaileys(),2000); }
      }
    });

    sock.ev.on('messages.upsert',async({messages,type})=>{
      try{
        if(type!=='notify') return;
        const m=messages[0]; if(!m?.message) return;
        const from=m.key.remoteJid;
        if(from==='status@broadcast'){
          if(global.db.settings.autostatus){ await sock.readMessages([m.key]).catch(()=>{}); }
          try{ if(autoPlugin && autoPlugin.onStatus) await autoPlugin.onStatus(sock, m); }catch{}
          try{ if(antiPlugin && antiPlugin.onStatus) await antiPlugin.onStatus(sock, m); }catch{}
          return;
        }
        const sender=m.key.participant||from;
        const isGroup=from.endsWith('@g.us');
        const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||m.message.videoMessage?.caption||"";
        const mtype=Object.keys(m.message)[0]||"";

        // ===== BUILD m WRAPPER FIRST - so Anti/Auto fit use m.body, m.isGroupAdmin etc =====
        m.body=body; m.text=body; m.sender=sender; m.chat=from; m.from=from; m.isGroup=isGroup; m.fromMe=m.key.fromMe;
        m.pushName=m.pushName||"User"; m.mtype=mtype;
        m.mentionedJid=m.message.extendedTextMessage?.contextInfo?.mentionedJid||[];
        m.isOwner=sender===config.ownerNumber+'@s.whatsapp.net'||global.db.sudo.includes(sender);
        m.reply=async(text, opts={})=>{ return sock.sendMessage(from, { text, mentions: opts.mentions||[] }, { quoted: m }).catch(()=>{}); };
        m.download=async()=>{ try{ return await downloadMediaMessage(m,'buffer',{},{logger:pino({level:"silent"}),reuploadRequest:sock.updateMediaMessage}); }catch(e){ console.log('Download fail:',e.message); return null; } };
        m.quoted=null;
        try{
          const ctx = m.message.extendedTextMessage?.contextInfo || m.message.imageMessage?.contextInfo || m.message.videoMessage?.contextInfo || m.message.stickerMessage?.contextInfo || null;
          if(ctx?.quotedMessage){
            const qMsg = ctx.quotedMessage;
            const inner = qMsg.viewOnceMessage || qMsg.viewOnceMessageV2 || qMsg.viewOnceMessageV2Extension || qMsg;
            const realMsg = inner.message || inner;
            m.quoted = {
              message: qMsg, sender: ctx.participant,
              mtype: Object.keys(realMsg)[0] || 'conversation',
              text: realMsg.conversation || realMsg.extendedTextMessage?.text || realMsg.imageMessage?.caption || realMsg.videoMessage?.caption || "",
              download: async()=>{
                try{
                  const fake = { key: { remoteJid: from, id: ctx.stanzaId, participant: ctx.participant }, message: qMsg };
                  return await downloadMediaMessage(fake,'buffer',{},{logger:pino({level:"silent"}),reuploadRequest:sock.updateMediaMessage});
                }catch(e){ console.log('Quoted download fail:',e.message); return null; }
              }
            };
          }
        }catch{}
        // isGroupAdmin / isBotAdmin
        m.isGroupAdmin=false; m.isBotAdmin=false;
        if(isGroup){
          try{
            const meta=await getCachedMeta(sock,from);
            if(meta){
              const me=meta.participants.find(p=>p.id===sender);
              m.isGroupAdmin=!!(me?.admin);
              const botId=sock.user.id.split(':')[0]+'@s.whatsapp.net';
              const bot=meta.participants.find(p=>p.id===botId||p.id===sock.user.id);
              m.isBotAdmin=!!(bot?.admin);
            }
          }catch{}
        }

        // ===== AUTO - supports both signatures =====
        try{ if(autoPlugin && autoPlugin.onMessage){ const r = await autoPlugin.onMessage(m, { sock, from, sender, body, isGroup }); if(r==='blocked') return; } }catch(e){ console.log('Auto onMessage fail:', e.message); }
        // ===== ANTI - supports both signatures =====
        try{ if(antiPlugin && antiPlugin.onMessage){ const r = await antiPlugin.onMessage(m, { sock, from, sender, body, isGroup }, getCachedMeta, getGroup); if(r==='punished') return; } }catch(e){ console.log('Anti onMessage fail:', e.message); }

                if(m.key.id){ global.db.messages[m.key.id]={text:body,sender,from,time:Date.now()}; if(Object.keys(global.db.messages).length>150) delete global.db.messages[Object.keys(global.db.messages)[0]]; }
        if(global.db.settings.autoread) await sock.readMessages([m.key]).catch(()=>{});

        // ===== VV AUTO - FIXED: download buffer, no be object =====
        if(isGroup){
          const g=getGroup(from);
          if((global.db.settings.autovv||g.antiviewonce)&&(m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension)){
            try{
              const buf = await downloadMediaMessage(m,'buffer',{},{logger:pino({level:"silent"}),reuploadRequest:sock.updateMediaMessage}).catch(()=>null);
              if(buf){
                const q=m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension;
                const inner=q?.message||q;
                if(inner?.imageMessage) await sock.sendMessage(from,{image:buf,caption:'👁️ AUTO VV'},{quoted:m}).catch(()=>{});
                else if(inner?.videoMessage) await sock.sendMessage(from,{video:buf,caption:'👁️ AUTO VV'},{quoted:m}).catch(()=>{});
                else if(inner?.audioMessage) await sock.sendMessage(from,{audio:buf,mimetype:'audio/mp4',ptt:true},{quoted:m}).catch(()=>{});
              }
            }catch{}
          }
          // Old inline anti delete as backup (Anti plugin already handles am)
          const hasAnti=g.antilink||g.antibot||g.antisticker||g.antiimage||g.antivideo;
          if(hasAnti && !m.isGroupAdmin && !m.isOwner && m.isBotAdmin){
            try{
              if(g.antilink&&/(https?:\/\/|chat\.whatsapp\.com|wa\.me|t\.me)/i.test(body)) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antibot&&m.key.id.startsWith('BAE5')) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antisticker&&mtype==='stickerMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antiimage&&mtype==='imageMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              if(g.antivideo&&mtype==='videoMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
            }catch{}
          }
        }

        if(!body) return;
        const prefix=global.db.settings.prefix||config.prefix||'.';
        if(!body.trim().startsWith(prefix)) return;
        const args=body.trim().slice(prefix.length).trim().split(/ +/);
        const cmdName=args.shift()?.toLowerCase(); if(!cmdName) return;
        if(controlSettings.disabledCmds.includes(cmdName)) return;
        const cat=getCategory(cmdName); if(cat&&controlSettings[cat]===false) return;
        const plugin=global.plugins.get(cmdName); if(!plugin) return;
        if(global.db.banned.includes(sender)) return;
        m.args=args;
        try{
          await plugin.execute(m, { sock, from, sender, args, prefix, isGroup, chat: from });
        }catch(e){ console.log(`Cmd ${cmdName} fail:`, e.message); await m.reply(`❌ Error: ${e.message}`).catch(()=>{}); }
      }catch(e){ console.log('messages.upsert fail:', e.message); }
    });

    sock.ev.on('messages.reaction',async()=>{});
  }
  await initBaileys();
}

module.exports = { startConnection };

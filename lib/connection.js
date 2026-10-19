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
  global.db.groups[jid] = global.db.groups[jid] || { antilink:false, antibot:false, antispam:false, antiflood:false, antivirtex:false, antibug:false, antidelete:false, antiviewonce:false, antisticker:false, antibadword:false, antiimage:false, antivideo:false, antidocument:false, antivoice:false, antipromote:false, antidemote:false, antiadd:false, welcome:false, goodbye:false, welcomeText:"", goodbyeText:"" };
  return global.db.groups[jid];
}

const controlFile = path.join(__dirname, '../control.json');
let controlSettings = { OWNER:true,BOT:true,GROUP:true,AI:true,DOWNLOADER:true,AUDIO:true,CONVERTER:true,LOGO:true,TOOLS:true,GAMES:true,FUN:true,PIES:true,PREMIUM:true,disabledCmds:[] };
try{ if(fs.existsSync(controlFile)){ const d=JSON.parse(fs.readFileSync(controlFile,'utf8')); if(!(d.disabledCmds&&d.disabledCmds.includes('*all*'))) controlSettings=d; } }catch{}
global.controlSettings=controlSettings;

const CATEGORY_MAP={
  OWNER:['mode','settings','password','setprefix','delprefix','setpp','setbotbio','autobio','autostatus','autotyping','autorecording','autoreact','anticall','antidelete','antiviewonce','addsudo','delsudo','sudolist','block','unblock','ban','unban','save','schedulestatus','chatbot','clearsession','cleartmp','pair','checkidch','setbotname','setowner','setownername','settings','autovv','autoread','autolike','autoreply','autoai','autopresence'],
  BOT:['owner','ping','alive','runtime','repo','menu','help','allmenu','uptime','speed','speedtest','list','commands'],
  GROUP:['add','kick','kickall','promote','demote','mute','unmute','lockgroup','unlockgroup','lock','unlock','open','close','revoke','grouplink','setname','setdesc','setgcpp','gcstatus','creategc','leavegc','groupinfo','ginfo','staff','jid','tagall','tag','hidetag','tagadmins','online','welcome','goodbye','rules','poll','antilink','antibot','antispam','antiviewonce','antidelete','antisticker','antibadword','slowmode','warn','warnings','members','admins','gc','gclink','setppgc','gcpp','setwelcome','setgoodbye','antilink2','antigroup','checkadmin','botadmin','setppgroup'],
  AI:['ai','gpt','gpt4','gemini','imagine','flux','dalle','txt2video','sora','imageedit','blackbox','llama','mistral','bot','zenithai'],
  DOWNLOADER:['play','song','music','ytmp3','mp3','ytmp4','video','instagram','tiktok','tt','facebook','fb','pinterest','anime','gitclone','apk','pixabay','gif','tourl','yt','ig','tik'],
  AUDIO:['bass','deep','blown','earrape','fast','slow','fat','squirrel','nightcore','robot','areverse','tomp3','tts'],
  CONVERTER:['sticker','s','simage','toimg','removebg','upscale','take','attp','qc','emojimix','tgsticker','blur','meme','getpp','wasted','character','tovideo','toaudio'],
  LOGO:['fancy','gfx','gfx2','gfx3','gfx4','gfx5','gfx6','gfx7','gfx8','gfx9','gfx10','gfx11','gfx12','metallic','ice','snow','impressive','matrix','neon','light','devil','purple','thunder','leaves','1917','arena','hacker','sand','blackpink','glitch','fire'],
  TOOLS:['ss','ssweb','translate','tr','qrcode','qr','shorturl','urlshortener','calculator','calc','hash','base64','binary','encrypt','decrypt','timestamp','currency','crypto','weather','news','livescore','reminder','lyrics','count','reverse','case','palindrome','age','vv','vv2','vv3','delete','savecontact','device','netflix','tourl','fancy','emojimix','readqr','pastebin','getpic','sticker','autovv'],
  GAMES:['trivia','scramble','wordle','hangman','guess','ttt','tictactoe','wyr','rps','slots','truth','dare','riddle','8ball','dice','coin','random','pick'],
  FUN:['joke','fact','quote','compliment','insult','roast','flirt','ship','simp','stupid','shayari','goodnight','roseday','iloveyou'],
  PIES:['pies','india','china','japan','korea','thai','malaysia'],
  PREMIUM:['premium','setbotpp','autoreply','away','schedule','filter','persona','ghost']
};
function getCategory(cmd){ cmd=cmd.toLowerCase(); for(const [cat,cmds] of Object.entries(CATEGORY_MAP)){ if(cmds.includes(cmd)) return cat; } return null; }

global.plugins=new Map();
function loadPlugins(){ const pPath=path.join(__dirname,'../plugins'); if(!fs.existsSync(pPath)) return; global.plugins.clear(); let t=0; function rd(dir){ const items=fs.readdirSync(dir); for(const it of items){ const full=path.join(dir,it); const st=fs.statSync(full); if(st.isDirectory()) rd(full); else if(it.endsWith('.js')){ try{ delete require.cache[require.resolve(full)]; const d=require(full); const arr=Array.isArray(d)?d:[d]; for(const pl of arr){ if(pl&&pl.name&&pl.execute){ global.plugins.set(pl.name.toLowerCase(),pl); if(pl.alias) for(const a of pl.alias) global.plugins.set(a.toLowerCase(),pl); t++; } } }catch(e){ console.log(`Load err ${it}: ${e.message}`)} } } } rd(pPath); console.log(chalk.green(`✅ WIRED ${t} cmds`)); }
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
    app.post('/api/pair',async(req,res)=>{
      try{
        let phone=(req.body.phone||'').replace(/[^0-9]/g,''); if(phone.length<10) return res.json({success:false,message:'Enter valid number'});
        if(!global.sock) return res.json({success:false,message:'Bot starting... wait 5 sec'});
        if(global.isConnected) return res.json({success:false,message:'Already linked!'});
        const code=await global.sock.requestPairingCode(phone); global.pairingCode=code; global.connectionStatus=`CODE: ${code}`; console.log(chalk.yellow(`🔑 CODE ${phone}: ${code}`)); res.json({success:true,code});
      }catch(e){ console.log('Pair fail',e.message); res.json({success:false,message:e.message}); }
    });
    app.post('/api/logout',async(req,res)=>{ try{ if(global.sock) await global.sock.logout().catch(()=>{}); }catch{} try{ fs.rmSync(`./${config.sessionName}`,{recursive:true,force:true}); }catch{} global.sock=null; global.isConnected=false; res.json({success:true}); setTimeout(()=>initBaileys(),2000); });
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
    const sock=makeWASocket({ version, logger:pino({level:'silent'}), printQRInTerminal:false, browser:Browsers.macOS('Safari'), auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))}, markOnlineOnConnect:true, connectTimeoutMs:60000, keepAliveIntervalMs:10000, syncFullHistory:false, retryRequestDelayMs:2000 });
    global.sock=sock; sock.ev.on('creds.update',saveCreds);

    sock.ev.on('call',async(calls)=>{ for(let c of calls){ try{ if(global.db.settings.anticall) await sock.rejectCall(c.id,c.from); }catch{} } });
    sock.ev.on('messages.update',async(updates)=>{ for(let up of updates){ if(up.update.message===null){ const saved=global.db.messages[up.key.id]; if(!saved) continue; const g=getGroup(saved.from); if(!g.antidelete) continue; try{ await sock.sendMessage(saved.from,{text:`*🔍 ANTIDELETE*\nFrom: @${saved.sender.split('@')[0]}\n> ${saved.text?.slice(0,300)}`,mentions:[saved.sender]}); }catch{} } } });
    sock.ev.on('group-participants.update',async(update)=>{ try{ const {id,participants,action}=update; const g=getGroup(id); const meta=await getCachedMeta(sock,id); if(!meta) return; const botIsAdmin=meta.participants.find(p=>p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net'||p.id===sock.user.id)?.admin; if(action==='add'&&g.welcome){ for(let p of participants) await sock.sendMessage(id,{text:(g.welcomeText||`Welcome @user`).replace(/@user/g,'@'+p.split('@')[0]),mentions:[p]}).catch(()=>{}); } if(action==='remove'&&g.goodbye){ for(let p of participants) await sock.sendMessage(id,{text:(g.goodbyeText||`Goodbye @${p.split('@')[0]}`).replace(/@user/g,'@'+p.split('@')[0]),mentions:[p]}).catch(()=>{}); } if(botIsAdmin){ if(action==='promote'&&g.antipromote) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"demote").catch(()=>{}); if(action==='demote'&&g.antidemote) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"promote").catch(()=>{}); if(action==='add'&&g.antiadd) for(let p of participants) await sock.groupParticipantsUpdate(id,[p],"remove").catch(()=>{}); } }catch{} });

    sock.ev.on('connection.update',async(update)=>{
      const {connection,lastDisconnect}=update;
      if(connection==='connecting') global.connectionStatus='Connecting...';
      if(connection==='open'){
        global.isConnected=true; global.connectionStatus='ONLINE ✅'; console.log(chalk.green.bold(`\n✅ ONLINE! ${global.plugins.size} CMDS\n`)); loadPlugins();
        // ✅ FIXED - No profilePictureUrl (this was causing "Something went wrong")
        try{ const jid=sock.user.id; await sock.sendMessage(jid,{text:`✅ *ZENITH-XMD LINKED*\n\n👤 ${sock.user.name||'User'}\n🔣 Prefix: ${config.prefix}\n⚡ ${global.plugins.size} CMDS\n\nType ${config.prefix}menu`}).catch(()=>{}); }catch{}
      }
      if(connection==='close'){
        const code=lastDisconnect?.error?.output?.statusCode; console.log(chalk.red(`❌ Closed ${code}`)); global.isConnected=false; global.sock=null; groupCache.clear();
        if([DisconnectReason.loggedOut,401,440,405].includes(code)){ try{ fs.rmSync(`./${config.sessionName}`,{recursive:true,force:true}); }catch{} global.connectionStatus='LOGGED OUT'; setTimeout(()=>initBaileys(),3000); }
        else{ global.connectionStatus='Reconnecting...'; setTimeout(()=>initBaileys(),5000); }
      }
    });

    sock.ev.on('messages.upsert',async({messages,type})=>{
      try{
        if(type!=='notify') return; const m=messages[0]; if(!m?.message) return; const from=m.key.remoteJid;
        if(from==='status@broadcast'){ if(global.db.settings.autostatus){ await sock.readMessages([m.key]).catch(()=>{}); } return; }
        const sender=m.key.participant||from; const isGroup=from.endsWith('@g.us'); const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||m.message.videoMessage?.caption||"";
        if(m.key.id){ global.db.messages[m.key.id]={text:body,sender,from,time:Date.now()}; if(Object.keys(global.db.messages).length>150) delete global.db.messages[Object.keys(global.db.messages)[0]]; }
        if(global.db.settings.autoread) await sock.readMessages([m.key]).catch(()=>{});
        if(isGroup){
          const g=getGroup(from);
          if((global.db.settings.autovv||g.antiviewonce)&&(m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension)){
            try{ const q=m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension; const inner=q?.message||q; if(inner?.imageMessage) await sock.sendMessage(from,{image:inner.imageMessage},{quoted:m}).catch(()=>{}); else if(inner?.videoMessage) await sock.sendMessage(from,{video:inner.videoMessage},{quoted:m}).catch(()=>{}); else await sock.sendMessage(from,{forward:q},{quoted:m}).catch(()=>{}); }catch{}
          }
          const hasAnti=g.antilink||g.antibot||g.antisticker||g.antiimage||g.antivideo;
          if(hasAnti){
            try{
              const meta=await getCachedMeta(sock,from); if(!meta) return;
              const botId=sock.user.id.split(':')[0]+'@s.whatsapp.net'; const botIsAdmin=meta.participants.find(p=>p.id===botId||p.id===sock.user.id)?.admin; const user=meta.participants.find(p=>p.id===sender); const isAdmin=user?.admin; const isOwner=sender===config.ownerNumber+'@s.whatsapp.net'||global.db.sudo.includes(sender);
              if(!isAdmin&&!isOwner&&botIsAdmin){
                const mtype=Object.keys(m.message)[0];
                if(g.antilink&&/(https?:\/\/|chat\.whatsapp\.com|wa\.me|t\.me)/i.test(body)) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                if(g.antibot&&m.key.id.startsWith('BAE5')) await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                if(g.antisticker&&mtype==='stickerMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                if(g.antiimage&&mtype==='imageMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
                if(g.antivideo&&mtype==='videoMessage') await sock.sendMessage(from,{delete:m.key}).catch(()=>{});
              }
            }catch{}
          }
        }
        if(!body) return; const prefix=global.db.settings.prefix||config.prefix||'.'; if(!body.trim().startsWith(prefix)) return;
        const args=body.trim().slice(prefix.length).trim().split(/ +/); const cmdName=args.shift()?.toLowerCase(); if(!cmdName) return;
        if(controlSettings.disabledCmds.includes(cmdName)) return; const cat=getCategory(cmdName); if(cat&&controlSettings[cat]===false) return;
        const plugin=global.plugins.get(cmdName); if(!plugin) return; if(global.db.banned.includes(sender)) return;
        const chat=from; m.body=body; m.text=body; m.args=args; m.sender=sender; m.chat=chat; m.from=from; m.isGroup=isGroup; m.fromMe=m.key.fromMe; m.pushName=m.pushName||"User"; m.mentionedJid=m.message.extendedTextMessage?.contextInfo?.mentionedJid||[]; m.isOwner=sender===config.ownerNumber+'@s.whatsapp.net'||global.db.sudo.includes(sender);
        m.download=async()=>await downloadMediaMessage(m,'buffer',{},{logger:pino({level:"silent"}),reuploadRequest:sock.updateMediaMessage});
        m.quoted=(()=>{ const ctx=m.message.extendedTextMessage?.contextInfo; if(!ctx?.quotedMessage) return null; return{ message:ctx.quotedMessage, sender:ctx.participant, mtype:Object.keys(ctx.quotedMessage)[0], download:async()=>await downloadMediaMessage({message:ctx.quotedMessage},'buffer',{},{logger:pino({level:"silent"}),reuploadRequest:sock.updateMediaMessage}) }; })();
        if(isGroup){ try{ const meta=await getCachedMeta(sock,from); if(meta){ const part=meta.participants.find(p=>p.id===sender); m.isGroupAdmin=!!part?.admin; m.isBotAdmin=!!meta.participants.find(p=>p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net'||p.id===sock.user.id)?.admin; } }catch{ m.isGroupAdmin=false; m.isBotAdmin=false; } }
        m.reply=async(txt)=>await sock.sendMessage(from,{text:txt},{quoted:m});
        console.log(chalk.green(`▶️ ${cmdName} ${sender.split('@')[0]}`));
        await plugin.execute(m,{sock,prefix,args,command:cmdName,config,plugins:global.plugins,from,sender,getGroup});
      }catch(e){ console.log(chalk.red(`Exec err: ${e.message}`)); }
    });
  }
  await initBaileys();
}
module.exports={startConnection};

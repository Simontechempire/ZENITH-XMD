// plugins/auto.js - ZENITH-XMD REAL AUTO - Commands + Handler in ONE file
// connection.js go call: auto.onMessage, auto.onStatus, auto.onGroupUpdate, auto.startTimers
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ========== DB ==========
function getDB(){
  global.db = global.db || {};
  global.db.settings = global.db.settings || {};
  global.db.groups = global.db.groups || {};
  global.db.xp = global.db.xp || {};
  global.db.newDM = global.db.newDM || {};
  global.db.autoreplyText = global.db.autoreplyText || "Hey 👋 I'm ZENITH-XMD 🐺\nType .menu to see commands";
  return global.db;
}
function toggleReply(m, name, isOn){
  return m.reply(
    `╭━━〔 🤖 ${name} 〕━━╮\n` +
    `┃ Status: ${isOn ? 'ON ✅' : 'OFF ❌'}\n` +
    `┃ Updated Successfully\n` +
    `╰━━━━━━━━━━━━━━━━━━`
  );
}
function checkOwner(m){
  const ownerNums = [global.config?.ownerNumber, ...(global.db?.sudo||[])].filter(Boolean);
  const isOwner = m.isOwner === true || ownerNums.some(n => m.sender?.startsWith(String(n)));
  if(!isOwner){ m.reply(`*👑 You are not my owner*`); return false; }
  return true;
}
function checkAdmin(m){
  if(!m.isGroup){ m.reply(`*⛔ Group only*`); return false; }
  const isAdmin = m.isGroupAdmin === true || m.isOwner === true;
  if(!isAdmin){ m.reply(`*⛔ Only group admin can use this*`); return false; }
  return true;
}
function parseToggle(m, args, current){
  const a = String(args[0]||'').toLowerCase();
  if(a==='on'||a==='1'||a==='enable') return true;
  if(a==='off'||a==='0'||a==='disable') return false;
  return !current;
}
function makeAuto(name, label, key, opts={}){
  return {
    name, alias: opts.alias||[], category:"auto",
    async execute(m, { args, from, sock }){
      if(opts.admin){ if(!checkAdmin(m)) return; }
      else { if(!checkOwner(m)) return; }
      const db = getDB();
      let on;
      if(opts.group){
        db.groups[from] = db.groups[from]||{};
        on = parseToggle(m, args, !!db.groups[from][key]);
        db.groups[from][key] = on;
        if(opts.global) db.settings[key]=on;
      } else {
        on = parseToggle(m, args, !!db.settings[key]);
        db.settings[key]=on;
        if(name==='autoreply' && args.length>1 && on) db.autoreplyText = args.slice(1).join(' ');
      }
      try{
        if(key==='autobio' && on && sock) await sock.updateProfileStatus(`🐺 ZENITH-XMD | ${new Date().toLocaleTimeString()} | .menu`).catch(()=>{});
        if(key==='autopresence' && on && sock) await sock.sendPresenceUpdate('available', from).catch(()=>{});
      }catch{}
      await toggleReply(m, label, on);
    }
  };
}

// ========== COMMANDS (switch only) ==========
const commands = [
  makeAuto("autostatus","Auto Status View","autostatus"),
  makeAuto("autostatusview","Auto Status View","autostatus"),
  makeAuto("autostatusseen","Auto Status Seen","autostatus"),
  makeAuto("autostory","Auto Story View","autostatus"),
  makeAuto("autoview","Auto View Status","autostatus"),
  makeAuto("autostatusreact","Auto Status React","autostatusreact"),
  makeAuto("autostatuslike","Auto Status Like","autolike"),
  makeAuto("autolike","Auto Like Status","autolike"),
  makeAuto("autolike2","Auto Like","autolike"),
  makeAuto("autoread","Auto Read (blue tick)","autoread"),
  makeAuto("autoreact","Auto React","autoreact"),
  makeAuto("autoreact2","Auto React","autoreact"),
  makeAuto("autoreply","Auto Reply (NEW DM only)","autoreply",{alias:["autorespond","autoresponse","autoanswer"]}),
  makeAuto("autoai","Auto AI (NEW DM)","autoai"),
  makeAuto("autochat","Auto Chat (NEW DM)","autoreply"),
  makeAuto("autobio","Auto Bio","autobio"),
  makeAuto("autobio2","Auto Bio","autobio"),
  makeAuto("autotyping","Auto Typing","autotyping"),
  makeAuto("autorecording","Auto Recording","autorecording"),
  makeAuto("autopresence","Auto Presence Online","autopresence"),
  makeAuto("autosticker","Auto Sticker (image -> sticker)","autosticker"),
  makeAuto("autotranslate","Auto Translate DM+Groups","autotranslate"),
  makeAuto("autoedit","Auto Edit","autoedit"),
  makeAuto("autovv","Auto ViewOnce Reveal","autovv"),
  makeAuto("autogreet","Auto Greet All Groups","autogreet",{admin:true, group:true, global:true}),
  makeAuto("autowelcome","Auto Welcome","welcome",{admin:true, group:true}),
  makeAuto("autogoodbye","Auto Goodbye","goodbye",{admin:true, group:true}),
  makeAuto("autolevel","Auto Level Ranking","autolevel",{alias:["autorank","autoleaderboard"]}),
  makeAuto("autorank","Auto Rank","autolevel"),
  makeAuto("autoleaderboard","Auto Leaderboard","autolevel"),
  makeAuto("autokick","Auto Kick","autokick",{admin:true, group:true}),
  makeAuto("autopromote","Auto Promote","autopromote",{admin:true, group:true}),
  makeAuto("autogroup","Auto Group","autogroup",{admin:true, group:true}),
  makeAuto("autodl","Auto DL Status","autodl",{alias:["autodownload"]}),
  makeAuto("autodownload","Auto Download Status","autodl"),
  makeAuto("autoforward","Auto Forward (owner DM -> groups)","autoforward"),
  makeAuto("autocall","Auto Call Block","anticall"),
  makeAuto("autodelete","Anti New DM Block","autodelete"),
  makeAuto("autoblock","Auto Block New DM","autodelete"),
  makeAuto("autounblock","Auto Unblock","autounblock"),
  makeAuto("autojoin","Auto Join Group Link","autojoin",{alias:["autojoin2"]}),
  makeAuto("autoowner","Auto Owner","autoowner"),
  makeAuto("autocmd","Auto CMD","autocmd"),
  makeAuto("autocomment","Auto Comment (Status React)","autostatusreact"),
  makeAuto("autopost","Auto Post To Status","autopost"),
  makeAuto("autobroadcast","Auto Broadcast To Groups","autobroadcast"),
  makeAuto("autoshare","Auto Share Status To Owner","autoshare"),
  {
    name:"autolist", category:"auto", alias:["autostatuslist"],
    async execute(m){
      if(!checkOwner(m)) return;
      const s = getDB().settings;
      const list = Object.entries(s).filter(([k])=>k.startsWith('auto')||k.startsWith('anti')).map(([k,v])=>`${k}: ${v?'ON ✅':'OFF ❌'}`).join('\n') || 'None ON';
      await m.reply(`╭━━〔 🤖 AUTO LIST 〕━━╮\n┃\n┃ ${list.split('\n').join('\n┃ ')}\n╰━━━━━━━━━━━━━━━━━━`);
    }
  },
  {
    name:"setautoreply", category:"auto",
    async execute(m,{args}){
      if(!checkOwner(m)) return;
      if(!args.length) return m.reply(`Usage: .setautoreply <text>\nCurrent: ${getDB().autoreplyText}`);
      getDB().autoreplyText = args.join(' ');
      await m.reply(`✅ AutoReply set to:\n${getDB().autoreplyText}`);
    }
  },
  {
    name:"level", category:"auto", alias:["rank","mylevel"],
    async execute(m,{from}){
      const db=getDB(); const xp=db.xp[from]?.[m.sender]||{xp:0,level:1,msgs:0};
      await m.reply(`🏆 LEVEL\n@${m.sender.split('@')[0]}\nLevel: ${xp.level}\nXP: ${xp.xp}\nMessages: ${xp.msgs}`,{mentions:[m.sender]});
    }
  },
  {
    name:"leaderboard", category:"auto", alias:["top"],
    async execute(m,{from}){
      const db=getDB(); const all=Object.entries(db.xp[from]||{}).sort((a,b)=>b[1].xp-a[1].xp).slice(0,10);
      if(!all.length) return m.reply('No XP yet. Chat to earn XP!');
      await m.reply(`🏆 LEADERBOARD\n\n${all.map(([id,d],i)=>`${i+1}. @${id.split('@')[0]} - Lv ${d.level} | ${d.xp} XP`).join('\n')}`,{mentions:all.map(([id])=>id)});
    }
  },
];

// ========== REAL HANDLER - connection.js go call these ==========
async function onMessage(sock, m, ctx){
  const { from, sender, body, isGroup } = ctx;
  const S = global.db.settings || {};
  const prefix = S.prefix || global.config?.prefix || '.';

  // 1. AUTOREAD
  if(S.autoread) await sock.readMessages([m.key]).catch(()=>{});

  // 2. AUTOTYPING / RECORDING / PRESENCE
  if(!m.key.fromMe){
    if(S.autotyping) await sock.sendPresenceUpdate('composing', from).catch(()=>{});
    else if(S.autorecording) await sock.sendPresenceUpdate('recording', from).catch(()=>{});
    if(S.autopresence) await sock.sendPresenceUpdate('available', from).catch(()=>{});
  }

  // 3. AUTOREACT
  if(S.autoreact && !m.key.fromMe){
    const emojis=['❤️','🔥','😂','😍','👍','💯','🐺','👑','😎'];
    await sock.sendMessage(from, { react:{ text: emojis[Math.floor(Math.random()*emojis.length)], key:m.key } }).catch(()=>{});
  }

  // 4. AUTOLEVEL - real XP
  if(S.autolevel && isGroup && !m.key.fromMe){
    global.db.xp[from]=global.db.xp[from]||{};
    const u=global.db.xp[from][sender]||{xp:0,level:1,msgs:0};
    u.xp+=5; u.msgs+=1;
    if(u.xp >= u.level*100){ u.level+=1; u.xp=0; await sock.sendMessage(from,{text:`🎉 LEVEL UP!\n@${sender.split('@')[0]} don reach Level ${u.level} 🏆`,mentions:[sender]}).catch(()=>{}); }
    global.db.xp[from][sender]=u;
  }

  // 5. AUTOSTICKER - any image/video -> sticker
  if(S.autosticker && !m.key.fromMe){
    try{
      const media = m.message.imageMessage || m.message.videoMessage;
      if(media){
        const stream = await downloadContentFromMessage(media, media.mimetype?.includes('video')?'video':'image');
        let buf=Buffer.from([]); for await(const c of stream) buf=Buffer.concat([buf,c]);
        await sock.sendMessage(from, { sticker: buf }, { quoted:m }).catch(()=>{});
      }
    }catch{}
  }

  // 6. AUTOTRANSLATE - real
  if(S.autotranslate && body && !body.startsWith(prefix) && !m.key.fromMe){
    try{
      const r = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(body)}`,{timeout:5000});
      const tr = r.data[0].map(x=>x[0]).join('');
      if(tr && tr.toLowerCase()!==body.toLowerCase()) await sock.sendMessage(from,{text:`🌍 Translate: ${tr}`},{quoted:m}).catch(()=>{});
    }catch{}
  }

  // 7. AUTOREPLY - NEW DM ONLY
  if(S.autoreply && !isGroup && !m.key.fromMe && body){
    global.db.newDM = global.db.newDM||{};
    if(!global.db.newDM[sender]){
      global.db.newDM[sender]=true;
      await sock.sendMessage(from,{text: global.db.autoreplyText},{quoted:m}).catch(()=>{});
    }
  }

  // 8. AUTOAI - NEW DM AI
  if(S.autoai && !isGroup && !m.key.fromMe && body && !body.startsWith(prefix)){
    global.db.newDM = global.db.newDM||{};
    if(!global.db.newDM[sender+'_ai']){
      global.db.newDM[sender+'_ai']=true;
      try{
        const r = await axios.get(`https://api.zenzxz.my.id/api/ai/gpt?query=${encodeURIComponent(body)}`,{timeout:8000});
        await sock.sendMessage(from,{text: r.data?.result || r.data?.answer || "Hey 👋 I'm ZENITH-XMD. Type .menu"},{quoted:m}).catch(()=>{});
      }catch{ await sock.sendMessage(from,{text:"Hey 👋 I'm ZENITH-XMD 🐺\nType .menu"},{quoted:m}).catch(()=>{}); }
    }
  }

  // 9. AUTODELETE / BLOCK NEW DM
  if(S.autodelete && !isGroup && !m.key.fromMe && !m.isOwner){
    global.db.newDM = global.db.newDM||{};
    if(!global.db.newDM[sender+'_blocked']){
      global.db.newDM[sender+'_blocked']=true;
      await sock.sendMessage(from,{text:`⛔ Sorry, I no dey accept new DMs.`}).catch(()=>{});
      await sock.updateBlockStatus(sender,'block').catch(()=>{});
    }
    return 'blocked';
  }

  // 10. AUTOVV
  if(S.autovv && (m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension)){
    try{
      const q=m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension;
      const inner=q?.message||q;
      if(inner?.imageMessage) await sock.sendMessage(from,{image:inner.imageMessage,caption:'👁️ AUTO VV - ZENITH-XMD'},{quoted:m}).catch(()=>{});
      else if(inner?.videoMessage) await sock.sendMessage(from,{video:inner.videoMessage,caption:'👁️ AUTO VV - ZENITH-XMD'},{quoted:m}).catch(()=>{});
    }catch{}
  }

  // 11. AUTOFORWARD - owner DM -> groups
  if(S.autoforward && !isGroup && m.isOwner && body){
    try{
      const groups = await sock.groupFetchAllParticipating().catch(()=>({}));
      for(const gid of Object.keys(groups).slice(0,5)) await sock.sendMessage(gid,{text:`📢 FORWARD FROM OWNER:\n${body}`}).catch(()=>{});
    }catch{}
  }

  // 12. AUTOJOIN
  if(S.autojoin && body && body.includes('chat.whatsapp.com/')){
    const code = body.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)?.[1];
    if(code) await sock.groupAcceptInvite(code).catch(()=>{});
  }

  return null;
}

async function onStatus(sock, m){
  const S = global.db.settings||{};
  if(S.autostatus) await sock.readMessages([m.key]).catch(()=>{});
  if(S.autolike) await sock.sendMessage('status@broadcast',{react:{text:'❤️',key:m.key}}).catch(()=>{});
  if(S.autostatusreact){
    const e=['❤️','🔥','😂','😍','👍'];
    await sock.sendMessage('status@broadcast',{react:{text:e[Math.floor(Math.random()*e.length)],key:m.key}}).catch(()=>{});
  }
  if(S.autodl || S.autoshare){
    try{
      const msg = m.message?.imageMessage || m.message?.videoMessage;
      if(msg && S.autodl){
        const stream = await downloadContentFromMessage(msg, msg.mimetype?.includes('video')?'video':'image');
        let buf=Buffer.from([]); for await(const c of stream) buf=Buffer.concat([buf,c]);
        const owner = (global.config?.ownerNumber||'2348071569915')+'@s.whatsapp.net';
        if(msg.mimetype?.includes('video')) await sock.sendMessage(owner,{video:buf,caption:`📥 Status DL from @${(m.key.participant||'').split('@')[0]}`}).catch(()=>{});
        else await sock.sendMessage(owner,{image:buf,caption:`📥 Status DL from @${(m.key.participant||'').split('@')[0]}`}).catch(()=>{});
      }
    }catch{}
  }
}

async function onGroupUpdate(sock, update, getGroup){
  const { id, participants, action } = update;
  const g = getGroup ? getGroup(id) : {};
  if(action==='add' && (g.welcome || global.db.settings?.autogreet)){
    for(const p of participants) await sock.sendMessage(id,{text:`👋 Welcome @${p.split('@')[0]} to the group! 🐺\nType .menu`,mentions:[p]}).catch(()=>{});
  }
  if(action==='remove' && (g.goodbye || global.db.settings?.autogreet)){
    for(const p of participants) await sock.sendMessage(id,{text:`👋 Goodbye @${p.split('@')[0]} - we go miss you!`,mentions:[p]}).catch(()=>{});
  }
  if(action==='add' && g.autopromote){
    for(const p of participants) await sock.groupParticipantsUpdate(id,[p],'promote').catch(()=>{});
  }
}

let _bioTimer=null, _greetTimer=null, _postTimer=null, _broadcastTimer=null, _lastGreetHour=-1;
function startTimers(sock){
  if(!_bioTimer) _bioTimer = setInterval(async()=>{
    if(global.db.settings?.autobio){ try{ await sock.updateProfileStatus(`🐺 ZENITH-XMD | ${new Date().toLocaleTimeString()} | .menu | ${new Date().toLocaleDateString()}`); }catch{} }
  }, 60000);
  if(!_greetTimer) _greetTimer = setInterval(async()=>{
    if(!global.db.settings?.autogreet) return;
    const h = new Date().getHours();
    if(h===_lastGreetHour) return;
    let greet=null;
    if(h===8) greet="🌅 Good Morning Fans! 🐺 ZENITH-XMD don wake! Type .menu";
    if(h===12) greet="☀️ Good Afternoon Fans! Hope una day dey sweet 🐺";
    if(h===18) greet="🌆 Good Evening Fans! How una day go? 🐺";
    if(!greet) return;
    _lastGreetHour=h;
    try{ const groups = await sock.groupFetchAllParticipating().catch(()=>({})); for(const gid of Object.keys(groups)) await sock.sendMessage(gid,{text:greet}).catch(()=>{}); }catch{}
  }, 60000);
  if(!_postTimer) _postTimer = setInterval(async()=>{
    if(!global.db.settings?.autopost) return;
    try{ await sock.sendMessage('status@broadcast',{text:`🐺 ZENITH-XMD | ${new Date().toLocaleString()} | Type .menu to use me!`}); }catch{}
  }, 6*60*60*1000);
  if(!_broadcastTimer) _broadcastTimer = setInterval(async()=>{
    if(!global.db.settings?.autobroadcast) return;
    try{ const groups = await sock.groupFetchAllParticipating().catch(()=>({})); for(const gid of Object.keys(groups)) await sock.sendMessage(gid,{text:`📢 ZENITH-XMD BROADCAST\nBot dey online ✅\nType .menu`}).catch(()=>{}); }catch{}
  }, 12*60*60*1000);
}

// Export commands + handler together - connection.js go use both
module.exports = commands;
module.exports.onMessage = onMessage;
module.exports.onStatus = onStatus;
module.exports.onGroupUpdate = onGroupUpdate;
module.exports.startTimers = startTimers;

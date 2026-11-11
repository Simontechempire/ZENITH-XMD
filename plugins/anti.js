const settings = require('../settings');

function getDB() {
  global.db = global.db || {};
  global.db.groups = global.db.groups || {};
  global.db.settings = global.db.settings || {};
  global.db.warnings = global.db.warnings || {};
  global.db.spam = global.db.spam || {};
  global.db.messages = global.db.messages || {};
  return global.db;
}

function getGroupDB(jid){
  const db = getDB();
  db.groups[jid] = db.groups[jid] || {
    antilink: false, antibot: false, antiforeign: false, antispam: false,
    antivirtex: false, antidelete: false, antiviewonce: false, antisticker: false,
    anticall: false, antifake: false, antilink2: false, antibadword: false,
    antiporn: false, antitag: false, antidemote: false, antipromote: false,
    antidocument: false, antiaudio: false, antivideo: false, antiimage: false,
    antilocation: false, anticontact: false, antivoice: false, antistatus: false,
    antibug: false, antilink3: false, antiwame: false, antigroup: false,
    antichannel: false, antiflood: false, antimention: false, antidelete2: false,
    antiedit: false, antipin: false, antiunpin: false, antikick: false,
    antiadd: false, antirevoke: false, antibutton: false, antilist: false, antipoll: false,
    antigmention: false, antigmentionMode: 'warndelete',
    antigcstatus: false, antigcstatusMode: 'warndelete',
  };
  if(db.groups[jid].antigmention===undefined) db.groups[jid].antigmention=false;
  if(db.groups[jid].antigmentionMode===undefined) db.groups[jid].antigmentionMode='warndelete';
  if(db.groups[jid].antigcstatus===undefined) db.groups[jid].antigcstatus=false;
  if(db.groups[jid].antigcstatusMode===undefined) db.groups[jid].antigcstatusMode='warndelete';
  return db.groups[jid];
}

function toggleReply(m, name, isOn) {
  const state = isOn ? "ON ✅" : "OFF ❌";
  return m.reply(`> *I would*\n> *Updated*\n*✅ ${name} is now ${state}*\n> *Successful*`);
}

const isAdmin = async (sock, from, sender) => {
  try {
    const metadata = await sock.groupMetadata(from);
    const participant = metadata.participants.find(p => p.id === sender);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  } catch { return false; }
};

function checkAdminMsg(m){
  return m.reply(`*⛔ Only group admin are authorised to use this commands*`);
}

function parseMode(arg){
  const a = String(arg||'').toLowerCase();
  if(a==='kick') return 'kick';
  if(a==='delete') return 'delete';
  if(a==='deletekick' || a==='delete+kick' || a==='deleteandkick') return 'deletekick';
  if(a==='warndelete' || a==='warn+delete' || a==='warnanddelete') return 'warndelete';
  if(a==='warn' || a==='warnonly') return 'warn';
  return null;
}
function modeText(mode){
  if(mode==='kick') return 'KICK';
  if(mode==='delete') return 'DELETE ONLY';
  if(mode==='deletekick') return 'DELETE + KICK';
  if(mode==='warndelete') return 'WARN + DELETE';
  if(mode==='warn') return 'WARN ONLY';
  return mode;
}

const commands = [
{
name: "antilink", alias: ["antilink1"], category: "anti", desc: "Block links in group",
async execute(m,{from,sender,args,sock}){
  if(!m.isGroup) return m.reply("Group only");
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilink = on;
  await toggleReply(m, "Anti Link", on);
}
},
{
name: "antilink2", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilink2 = on;
  await toggleReply(m, "Anti Link2", on);
}
},
{
name: "antibot", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibot = on;
  await toggleReply(m, "Anti Bot", on);
}
},
{
name: "antiforeign", alias: ["antifake","antine"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiforeign = on;
  await toggleReply(m, "Anti Foreign Number", on);
}
},
{
name: "antispam", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antispam = on;
  await toggleReply(m, "Anti Spam", on);
}
},
{
name: "antivirtex", alias: ["antibug","antitrava"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antivirtex = on;
  await toggleReply(m, "Anti Virtex/Bug", on);
}
},
{
name: "antidelete", alias: ["antidel"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidelete = on;
  await toggleReply(m, "Anti Delete", on);
}
},
{
name: "antiviewonce", alias: ["antivv","antionce"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiviewonce = on;
  await toggleReply(m, "Anti ViewOnce", on);
}
},
{
name: "antisticker", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antisticker = on;
  await toggleReply(m, "Anti Sticker", on);
}
},
{
name: "anticall", alias: ["antical"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!m.isGroup) {
    getDB().settings.anticall = args[0]=='on';
    return toggleReply(m, "Anti Call (Global)", args[0]=='on');
  }
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).anticall = on;
  await toggleReply(m, "Anti Call", on);
}
},
{
name: "antifake", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antifake = on;
  await toggleReply(m, "Anti Fake Number", on);
}
},
{
name: "antitag", alias: ["antihidetag"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antitag = on;
  await toggleReply(m, "Anti Tag/Hidetag", on);
}
},
{
name: "antibadword", alias: ["antibad"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibadword = on;
  await toggleReply(m, "Anti Bad Word", on);
}
},
{
name: "antiporn", alias: ["antinsfw"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiporn = on;
  await toggleReply(m, "Anti Porn/NSFW", on);
}
},
{
name: "antidemote", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidemote = on;
  await toggleReply(m, "Anti Demote", on);
}
},
{
name: "antipromote", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antipromote = on;
  await toggleReply(m, "Anti Promote", on);
}
},
{
name: "antilocation", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilocation = on;
  await toggleReply(m, "Anti Location", on);
}
},
{
name: "anticontact", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).anticontact = on;
  await toggleReply(m, "Anti Contact", on);
}
},
{
name: "antivoice", alias: ["antiaudio"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antivoice = on;
  await toggleReply(m, "Anti Voice/Audio", on);
}
},
{
name: "antidocument", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidocument = on;
  await toggleReply(m, "Anti Document", on);
}
},
{
name: "antivideo", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antivideo = on;
  await toggleReply(m, "Anti Video", on);
}
},
{
name: "antiimage", alias: ["antiphoto"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiimage = on;
  await toggleReply(m, "Anti Image", on);
}
},
{
name: "antistatus", alias: ["antistatusmention"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antistatus = on;
  await toggleReply(m, "Anti Status Mention", on);
}
},
{
name: "antibug2", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibug = on;
  await toggleReply(m, "Anti Bug V2", on);
}
},
{
name: "antiwame", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiwame = on;
  await toggleReply(m, "Anti Wa.me Link", on);
}
},
{
name: "antigroup", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antigroup = on;
  await toggleReply(m, "Anti Group Link", on);
}
},
{
name: "antichannel", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antichannel = on;
  await toggleReply(m, "Anti Channel Link", on);
}
},
{
name: "antilink3", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilink3 = on;
  await toggleReply(m, "Anti Link V3", on);
}
},
{
name: "antiflood", alias: ["antispam2"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiflood = on;
  await toggleReply(m, "Anti Flood", on);
}
},
{
name: "antimention", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antimention = on;
  await toggleReply(m, "Anti Mention", on);
}
},
{
name: "antidelete2", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidelete2 = on;
  await toggleReply(m, "Anti Delete V2", on);
}
},
{
name: "antiedit", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiedit = on;
  await toggleReply(m, "Anti Edit Message", on);
}
},
{
name: "antipin", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antipin = on;
  await toggleReply(m, "Anti Pin", on);
}
},
{
name: "antiunpin", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiunpin = on;
  await toggleReply(m, "Anti Unpin", on);
}
},
{
name: "antikick", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antikick = on;
  await toggleReply(m, "Anti Kick", on);
}
},
{
name: "antiadd", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiadd = on;
  await toggleReply(m, "Anti Add Member", on);
}
},
{
name: "antirevoke", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antirevoke = on;
  await toggleReply(m, "Anti Revoke Link", on);
}
},
{
name: "antibutton", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibutton = on;
  await toggleReply(m, "Anti Button Message", on);
}
},
{
name: "antilist", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilist = on;
  await toggleReply(m, "Anti List Message", on);
}
},
{
name: "antipoll", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antipoll = on;
  await toggleReply(m, "Anti Poll", on);
}
},
{
name: "antiall", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on';
  const g = getGroupDB(from);
  Object.keys(g).forEach(k=>{ if(k.startsWith('anti')) g[k]=on; });
  await toggleReply(m, "Anti All", on);
}
},
{
name: "antistatuslist", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const g = getGroupDB(from);
  const list = Object.entries(g).filter(([k])=>k.startsWith('anti')).map(([k,v])=>`${k}: ${v?'ON ✅':'OFF ❌'}`).join('\n');
  await m.reply(`╭━━〔 🚫 ANTI LIST 〕━━╮\n┃\n┃ ${list.split('\n').join('\n┃ ')}\n╰━━━━━━━━━━━━━━━━━━`);
}
},
{
name: "warn", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const target = m.mentionedJid?.[0] || m.quoted?.sender;
  if(!target) return m.reply(`Usage: .warn @user`);
  getDB().warnings[target]=getDB().warnings[target]||{}; getDB().warnings[target][from]=(getDB().warnings[target][from]||0)+1;
  await m.reply(`⚠️ Warn ${getDB().warnings[target][from]}/3 for @${target.split('@')[0]}`,{mentions:[target]});
}
},
{
name: "warnings", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const all=Object.entries(getDB().warnings||{}).map(([id,gd])=>`@${id.split('@')[0]}: ${gd[from]||0}/3`).join('\n')||'No warnings';
  await m.reply(`⚠️ WARNINGS\n${all}`,{mentions:Object.keys(getDB().warnings||{})});
}
},
{
name: "resetwarn", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const target = m.mentionedJid?.[0] || m.quoted?.sender;
  if(!target) return m.reply(`Usage: .resetwarn @user`);
  getDB().warnings[target]=getDB().warnings[target]||{}; getDB().warnings[target][from]=0;
  await m.reply(`✅ Warn cleared for @${target.split('@')[0]}`,{mentions:[target]});
}
},
{
name: "antigmention", alias: ["antigroupmention","antigstatusmention"], category: "anti",
async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const g = getGroupDB(from);
  if(args[0]==='mode' || args[0]==='set'){
    const mode = parseMode(args[1]);
    if(!mode) return m.reply(`Usage: .antigmention mode <kick|warn|delete|warndelete|deletekick>\nCurrent: ${modeText(g.antigmentionMode)}`);
    g.antigmentionMode = mode;
    return m.reply(`> *I would*\n> *Updated*\n*✅ Anti Group Mention Mode is now ${modeText(mode)}*\n> *Successful*`);
  }
  const mode = parseMode(args[1]);
  if(mode) g.antigmentionMode = mode;
  const on = args[0]=='on';
  if(args[0]!=='on' && args[0]!=='off' && !mode) return m.reply(`Usage:\n.antigmention on [kick|warn|delete|warndelete|deletekick]\n.antigmention off\n.antigmention mode kick\nCurrent: ${g.antigmention?'ON ✅':'OFF ❌'} | Mode: ${modeText(g.antigmentionMode)}`);
  g.antigmention = on;
  await m.reply(`> *I would*\n> *Updated*\n*✅ Anti Group Mention (Mention group in status) is now ${on?'ON ✅':'OFF ❌'}*\n*Mode: ${modeText(g.antigmentionMode)}*\n> *Successful*`);
}
},
{
name: "antigmentionmode", alias: ["antigmention-mode"], category: "anti",
async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const g = getGroupDB(from);
  const mode = parseMode(args[0]);
  if(!mode) return m.reply(`Usage: .antigmentionmode <kick|warn|delete|warndelete|deletekick>\nCurrent: ${modeText(g.antigmentionMode)}`);
  g.antigmentionMode = mode;
  await m.reply(`✅ Anti Group Mention Mode: ${modeText(mode)}`);
}
},
{
name: "antigcstatus", alias: ["antigroupstatus","antigstatus"], category: "anti",
async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const g = getGroupDB(from);
  if(args[0]==='mode' || args[0]==='set'){
    const mode = parseMode(args[1]);
    if(!mode) return m.reply(`Usage: .antigcstatus mode <kick|warn|delete|warndelete|deletekick>\nCurrent: ${modeText(g.antigcstatusMode)}`);
    g.antigcstatusMode = mode;
    return m.reply(`> *I would*\n> *Updated*\n*✅ Anti GC Status Mode is now ${modeText(mode)}*\n> *Successful*`);
  }
  const mode = parseMode(args[1]);
  if(mode) g.antigcstatusMode = mode;
  const on = args[0]=='on';
  if(args[0]!=='on' && args[0]!=='off' && !mode) return m.reply(`Usage:\n.antigcstatus on [kick|warn|delete|warndelete|deletekick]\n.antigcstatus off\n.antigcstatus mode kick\nCurrent: ${g.antigcstatus?'ON ✅':'OFF ❌'} | Mode: ${modeText(g.antigcstatusMode)}`);
  g.antigcstatus = on;
  await m.reply(`> *I would*\n> *Updated*\n*✅ Anti GC Status (Posting in group status) is now ${on?'ON ✅':'OFF ❌'}*\n*Mode: ${modeText(g.antigcstatusMode)}*\n> *Successful*`);
}
},
{
name: "antigcstatusmode", alias: ["antigcstatus-mode"], category: "anti",
async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const g = getGroupDB(from);
  const mode = parseMode(args[0]);
  if(!mode) return m.reply(`Usage: .antigcstatusmode <kick|warn|delete|warndelete|deletekick>\nCurrent: ${modeText(g.antigcstatusMode)}`);
  g.antigcstatusMode = mode;
  await m.reply(`✅ Anti GC Status Mode: ${modeText(mode)}`);
}
},
];

// ===== ✅ ENGINE =====
async function doAction(sock, m, from, sender, g, reason){
  try{
    if(m.isGroupAdmin) return;
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if(sender === botId || sender === sock.user?.id) return;
    if(settings.owner.includes(sender.split('@')[0])) return;
    try{ await sock.sendMessage(from, { delete: m.key }); }catch{}
    getDB().warnings[sender] = getDB().warnings[sender] || {};
    getDB().warnings[sender][from] = (getDB().warnings[sender][from]||0)+1;
    const warns = getDB().warnings[sender][from];
    await sock.sendMessage(from, { text: `🚫 *ANTI ${reason}*\n@${sender.split('@')[0]} warn ${warns}/3\nMessage deleted.`, mentions: [sender] }).catch(()=>{});
    if(warns >= 3){
      try{ await sock.groupParticipantsUpdate(from, [sender], 'remove'); }catch{}
      getDB().warnings[sender][from] = 0;
            await sock.sendMessage(from, { text: `👢 @${sender.split('@')[0]} kicked - 3 warnings`, mentions: [sender] }).catch(()=>{});
    }
  }catch(e){ console.log('Anti action fail:', e.message); }
}

async function onMessage(m, { sock, from, sender }){
  try{
    if(!m.isGroup) return;
    if(!m.isBotAdmin) return;
    if(m.fromMe) return;
    const g = getGroupDB(from);
    const text = (m.body || m.text || "").toLowerCase();
    const mtype = m.mtype || "";
    if(g.antilink && /https?:\/\/|wa\.me\/|chat\.whatsapp\.com|t\.me\/|discord\.gg|instagram\.com|youtube\.com|youtu\.be/i.test(text)){
      return await doAction(sock, m, from, sender, g, 'LINK');
    }
    if(g.antilink2 && /https?:\/\//i.test(text)){
      return await doAction(sock, m, from, sender, g, 'LINK2');
    }
    if(g.antiwame && /wa\.me\//i.test(text)){
      return await doAction(sock, m, from, sender, g, 'WA.ME');
    }
    if(g.antigroup && /chat\.whatsapp\.com/i.test(text)){
      return await doAction(sock, m, from, sender, g, 'GROUP LINK');
    }
    if(g.antichannel && /whatsapp\.com\/channel/i.test(text)){
      return await doAction(sock, m, from, sender, g, 'CHANNEL LINK');
    }
    if(g.antibadword && /\b(fuck|shit|bitch|bastard|dick|pussy|porn|sex)\b/i.test(text)){
      return await doAction(sock, m, from, sender, g, 'BAD WORD');
    }
    if(g.antisticker && mtype === 'stickerMessage'){
      return await doAction(sock, m, from, sender, g, 'STICKER');
    }
    if(g.antiimage && mtype === 'imageMessage'){
      return await doAction(sock, m, from, sender, g, 'IMAGE');
    }
    if(g.antivideo && mtype === 'videoMessage'){
      return await doAction(sock, m, from, sender, g, 'VIDEO');
    }
    if(g.antidocument && mtype === 'documentMessage'){
      return await doAction(sock, m, from, sender, g, 'DOCUMENT');
    }
    if(g.antivoice && (mtype === 'audioMessage' || mtype === 'ptvMessage')){
      return await doAction(sock, m, from, sender, g, 'VOICE');
    }
    if(g.antilocation && mtype === 'locationMessage'){
      return await doAction(sock, m, from, sender, g, 'LOCATION');
    }
    if(g.anticontact && (mtype === 'contactMessage' || mtype === 'contactsArrayMessage')){
      return await doAction(sock, m, from, sender, g, 'CONTACT');
    }
    if(g.antibot && m.isBot){
      return await doAction(sock, m, from, sender, g, 'BOT');
    }
    if(g.antimention && m.mentionedJid && m.mentionedJid.length > 5){
      return await doAction(sock, m, from, sender, g, 'MENTION');
    }
    if(g.antitag && m.mentionedJid && m.mentionedJid.length > 0 && !text.includes('@')){
      return await doAction(sock, m, from, sender, g, 'HIDETAG');
    }
    if(g.antipoll && mtype === 'pollCreationMessage'){
      return await doAction(sock, m, from, sender, g, 'POLL');
    }
    if(g.antiforeign && !sender.startsWith('234')){
      return await doAction(sock, m, from, sender, g, 'FOREIGN');
    }
    if(g.antispam || g.antiflood){
      const now = Date.now();
      getDB().spam[sender] = getDB().spam[sender] || [];
      getDB().spam[sender].push(now);
      getDB().spam[sender] = getDB().spam[sender].filter(t => now - t < 10000);
      if(getDB().spam[sender].length > 5){
        getDB().spam[sender] = [];
        return await doAction(sock, m, from, sender, g, 'SPAM/FLOOD');
      }
    }
    if(g.antivirtex && text.length > 5000){
      return await doAction(sock, m, from, sender, g, 'VIRTEX');
    }
  }catch(e){ console.log('Anti onMessage fail:', e.message); }
}

async function onGroupUpdate(sock, update){
  try{
    if(!update || !update.id) return;
    const g = getGroupDB(update.id);
    return g;
  }catch{}
}

async function onDelete(sock, msg){
  return;
}

async function onStatus(sock, status){
  return;
}

module.exports = { commands, onMessage, onGroupUpdate, onDelete, onStatus, getGroupDB, getDB };

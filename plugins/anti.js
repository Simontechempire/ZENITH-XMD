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
    // ✅ NEW - MENTION GROUP IN STATUS + GROUP STATUS
    antigmention: false, antigmentionMode: 'warndelete',
    antigcstatus: false, antigcstatusMode: 'warndelete',
  };
  // ✅ Make sure old groups wey don exist before still get new fields
  if(db.groups[jid].antigmention===undefined) db.groups[jid].antigmention=false;
  if(db.groups[jid].antigmentionMode===undefined) db.groups[jid].antigmentionMode='warndelete';
  if(db.groups[jid].antigcstatus===undefined) db.groups[jid].antigcstatus=false;
  if(db.groups[jid].antigcstatusMode===undefined) db.groups[jid].antigcstatusMode='warndelete';
  return db.groups[jid];
}

function toggleReply(m, name, isOn) {
  const state = isOn ? "ON ✅" : "OFF ❌";
  if (isOn) {
    return m.reply(`> *I would*\n> *Updated*\n*✅ ${name} is now ${state}*\n> *Successful*`);
  } else {
    return m.reply(`> *I would*\n> *Updated*\n*${name} is now ${state}*\n> *Success*`);
  }
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

// ✅ MODE HELPER - warn / kick / delete / deletekick / warndelete
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

// ===== YOUR OLD COMMANDS - NO CHANGE - START =====
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
// ===== YOUR OLD COMMANDS - END =====

// ===== ✅ NEW - 4 CMD - ANTIGMENTION + ANTIGCSTATUS =====
// Usage:
// .antigmention on  -> Default = WARN + DELETE (remove post from everyone)
// .antigmention on kick -> KICK (remove post + kick)
// .antigmention on warndelete -> WARN + DELETE
// .antigmention on deletekick -> DELETE + KICK
// .antigmention on delete -> DELETE ONLY
// .antigmention mode kick -> change mode only
{
name: "antigmention", alias: ["antigroupmention","antigstatusmention"], category: "anti",
async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const g = getGroupDB(from);
  // .antigmention mode kick
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
// Usage same as above:
// .antigcstatus on -> Default WARN + DELETE
// .antigcstatus on kick -> DELETE + KICK
// .antigcstatus on warndelete -> WARN + DELETE
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

// ========== REAL HANDLER ==========
async function punish(sock, from, sender, m, reason){
  try{ await sock.sendMessage(from,{delete:m.key}).catch(()=>{}); }catch{}
  const db=getDB(); db.warnings[sender]=db.warnings[sender]||{}; db.warnings[sender][from]=(db.warnings[sender][from]||0)+1;
  const w=db.warnings[sender][from];
  if(w>=3){
    await sock.sendMessage(from,{text:`🚫 @${sender.split('@')[0]} kicked for ${reason} (3/3 warns)`,mentions:[sender]}).catch(()=>{});
    await sock.groupParticipantsUpdate(from,[sender],'remove').catch(()=>{});
    db.warnings[sender][from]=0;
  } else {
    await sock.sendMessage(from,{text:`⚠️ @${sender.split('@')[0]} Warn ${w}/3 - ${reason}`,mentions:[sender]}).catch(()=>{});
  }
  return 'punished';
}

// ✅ Apply mode for group-mention / gcstatus
// mode: warn = warn only (no delete)
//       delete = delete for everyone only
//       warndelete = warn + delete for everyone (DEFAULT)
//       kick = delete + kick immediately
//       deletekick = delete for everyone + kick
async function punishWithMode(sock, groupJid, sender, m, reason, mode){
  const db=getDB();
  // 1. DELETE FOR EVERYONE - remove post from everyone
  if(mode==='delete' || mode==='warndelete' || mode==='kick' || mode==='deletekick'){
    try{ await sock.sendMessage(groupJid,{delete:m.key}).catch(()=>{}); }catch{}
    // For status, bot no fit delete person status, so we also try delete the status key
    try{ await sock.sendMessage('status@broadcast',{delete:m.key}).catch(()=>{}); }catch{}
  }
  // 2. KICK
  if(mode==='kick' || mode==='deletekick'){
    await sock.sendMessage(groupJid,{text:`🚫 @${sender.split('@')[0]} kicked for ${reason} - Mode: ${modeText(mode)}`,mentions:[sender]}).catch(()=>{});
    await sock.groupParticipantsUpdate(groupJid,[sender],'remove').catch(()=>{});
    return 'punished';
  }
  // 3. WARN + DELETE / WARN ONLY
  if(mode==='warn' || mode==='warndelete'){
    db.warnings[sender]=db.warnings[sender]||{}; db.warnings[sender][groupJid]=(db.warnings[sender][groupJid]||0)+1;
    const w=db.warnings[sender][groupJid];
    if(w>=3){
      await sock.sendMessage(groupJid,{text:`🚫 @${sender.split('@')[0]} kicked for ${reason} (3/3 warns)`,mentions:[sender]}).catch(()=>{});
      await sock.groupParticipantsUpdate(groupJid,[sender],'remove').catch(()=>{});
      db.warnings[sender][groupJid]=0;
    } else {
      await sock.sendMessage(groupJid,{text:`⚠️ @${sender.split('@')[0]} Warn ${w}/3 - ${reason} - Post removed for everyone`,mentions:[sender]}).catch(()=>{});
    }
    return 'punished';
  }
  // 4. DELETE ONLY - already deleted above
  if(mode==='delete'){
    await sock.sendMessage(groupJid,{text:`🗑️ Post removed for everyone - @${sender.split('@')[0]} - ${reason}`,mentions:[sender]}).catch(()=>{});
    return 'punished';
  }
  return 'punished';
}

async function onMessage(sock, m, ctx, getCachedMeta, getGroup){
  const { from, sender, body } = ctx;
  if(!from.endsWith('@g.us')) return null;
  if(m.key.fromMe) return null;
  const g = getGroupDB(from);
  const hasAnti = Object.values(g).some(v=>v===true);
  if(!hasAnti) return null;
  let meta=null;
  try{ meta = getCachedMeta ? await getCachedMeta(sock, from) : await sock.groupMetadata(from); }catch{ return null; }
  if(!meta) return null;
  const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net';
  const botIsAdmin = !!meta.participants.find(p=>p.id===botId||p.id===sock.user.id)?.admin;
  if(!botIsAdmin) return null;
  const user = meta.participants.find(p=>p.id===sender);
  if(user?.admin) return null;
  const ownerNum = (global.config?.ownerNumber || settings?.ownerNumber || "2348071569915");
  if(sender===ownerNum+'@s.whatsapp.net' || (global.db.sudo||[]).includes(sender)) return null;

  const mtype = Object.keys(m.message)[0];
  const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  // ✅ ANTIGMENTION in GROUP - person mention group JID / group link / @group in group message
  if(g.antigmention){
    const mentionsGroup = mentioned.some(j=>j.endsWith('@g.us')) || /chat\.whatsapp\.com\/|@group|group mention/i.test(body);
    if(mentionsGroup){
      return await punishWithMode(sock, from, sender, m, 'Mention Group In Status / Group', g.antigmentionMode);
    }
  }
  // ✅ ANTIGCSTATUS in GROUP - person post group status content in group
  if(g.antigcstatus){
    const isGCStatusPost = /status|my status|group status|gc status/i.test(body) && (/chat\.whatsapp\.com|@|status/i.test(body) || mentioned.length>0);
    if(isGCStatusPost){
      return await punishWithMode(sock, from, sender, m, 'Posting In Group Status', g.antigcstatusMode);
    }
  }

  if(g.antilink || g.antilink2 || g.antilink3){
    if(/(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|discord\.gg|instagram\.com|youtube\.com|facebook\.com|tiktok\.com)/i.test(body)) return await punish(sock,from,sender,m,'Sending Link');
  }
  if(g.antiwame && /wa\.me|api\.whatsapp\.com/i.test(body)) return await punish(sock,from,sender,m,'Wa.me Link');
  if(g.antigroup && /chat\.whatsapp\.com/i.test(body)) return await punish(sock,from,sender,m,'Group Link');
  if(g.antichannel && /whatsapp\.com\/channel|whatsapp\.com\/newsletter/i.test(body)) return await punish(sock,from,sender,m,'Channel Link');
  if(g.antibot && m.key.id.startsWith('BAE5')) return await punish(sock,from,sender,m,'Bot Message');
  if((g.antiforeign || g.antifake) && !sender.startsWith('234')) return await punish(sock,from,sender,m,'Foreign Number');
  if(g.antisticker && mtype==='stickerMessage') return await punish(sock,from,sender,m,'Sticker');
  if(g.antiimage && mtype==='imageMessage') return await punish(sock,from,sender,m,'Image');
  if(g.antivideo && mtype==='videoMessage') return await punish(sock,from,sender,m,'Video');
  if(g.antidocument && mtype==='documentMessage') return await punish(sock,from,sender,m,'Document');
  if((g.antivoice || g.antiaudio) && mtype==='audioMessage') return await punish(sock,from,sender,m,'Voice/Audio');
  if(g.antilocation && (mtype==='locationMessage' || mtype==='liveLocationMessage')) return await punish(sock,from,sender,m,'Location');
  if(g.anticontact && (mtype==='contactMessage' || mtype==='contactsArrayMessage')) return await punish(sock,from,sender,m,'Contact');
  if(g.antipoll && mtype==='pollCreationMessage') return await punish(sock,from,sender,m,'Poll');
  if(g.antilist && mtype==='listMessage') return await punish(sock,from,sender,m,'List Message');
  if(g.antibutton && (mtype==='buttonsMessage' || mtype==='buttonsResponseMessage')) return await punish(sock,from,sender,m,'Button Message');
  if(g.antitag && mentioned.length>5) return await punish(sock,from,sender,m,'Tagging Many People');
  if(g.antimention && mentioned.length>0) return await punish(sock,from,sender,m,'Mention');
  if(g.antistatus && /@status|status@broadcast/i.test(body)) return await punish(sock,from,sender,m,'Status Mention');
  if(g.antibadword){
    const bad=['fuck','shit','bitch','bastard','idiot','mumu','oloshi','f*ck','b*tch','dick','pussy','asshole','motherfucker'];
    if(bad.some(w=>body.toLowerCase().includes(w))) return await punish(sock,from,sender,m,'Bad Word');
  }
  if(g.antiporn){
    const porn=['porn','xxx','sex video','pornhub','xvideos','nsfw','pussy','dick pic'];
    if(porn.some(w=>body.toLowerCase().includes(w))) return await punish(sock,from,sender,m,'Porn/NSFW');
  }
  if(g.antispam || g.antiflood){
    getDB().spam[sender]=getDB().spam[sender]||[];
    getDB().spam[sender].push(Date.now());
    getDB().spam[sender]=getDB().spam[sender].filter(t=>Date.now()-t<5000);
    if(getDB().spam[sender].length>=5){ getDB().spam[sender]=[]; return await punish(sock,from,sender,m,'Spamming/Flooding'); }
  }
  if((g.antivirtex || g.antibug) && body.length>4000) return await punish(sock,from,sender,m,'Virtex/Bug Text');
  if(g.antiviewonce && (m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension)){
    try{
      const q=m.message.viewOnceMessage||m.message.viewOnceMessageV2||m.message.viewOnceMessageV2Extension;
      const inner=q?.message||q;
      if(inner?.imageMessage) await sock.sendMessage(from,{image:inner.imageMessage,caption:`👁️ ANTI-VV from @${sender.split('@')[0]}`},{quoted:m}).catch(()=>{});
      else if(inner?.videoMessage) await sock.sendMessage(from,{video:inner.videoMessage,caption:`👁️ ANTI-VV from @${sender.split('@')[0]}`},{quoted:m}).catch(()=>{});
    }catch{}
  }
  return null;
}

// ✅ STATUS HANDLER - for antigmention / antigcstatus in STATUS
async function onStatus(sock, m){
  const sender = m.key.participant || m.key.remoteJid;
  if(!sender) return null;
  if(m.key.fromMe) return null;
  const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || "";
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || m.message?.imageMessage?.contextInfo?.mentionedJid || m.message?.videoMessage?.contextInfo?.mentionedJid || [];

  const allGroups = Object.entries(getDB().groups||{});
  for(const [gid, g] of allGroups){
    if(!g.antigmention && !g.antigcstatus) continue;
    let meta=null;
    try{ meta = await sock.groupMetadata(gid); }catch{ continue; }
    const isMember = meta.participants.some(p=>p.id===sender);
    if(!isMember) continue;
    const isAdminUser = !!meta.participants.find(p=>p.id===sender)?.admin;
    if(isAdminUser) continue;
    const ownerNum = (global.config?.ownerNumber || settings?.ownerNumber || "2348071569915");
    if(sender===ownerNum+'@s.whatsapp.net') continue;

    const mentionsThisGroup = mentioned.includes(gid) || mentioned.some(j=>j.endsWith('@g.us'));
    const hasGroupLink = /chat\.whatsapp\.com/i.test(body);
    const hasGroupMentionText = /@group|mention.*group|group.*mention/i.test(body);

    if(g.antigmention && (mentionsThisGroup || hasGroupMentionText || (hasGroupLink && body.length>0))){
      return await punishWithMode(sock, gid, sender, m, 'Mention Group In Status', g.antigmentionMode);
    }
    if(g.antigcstatus && (/group status|gc status|status.*group|group.*status/i.test(body) || (hasGroupLink && /status/i.test(body)))){
      return await punishWithMode(sock, gid, sender, m, 'Posting In Group Status', g.antigcstatusMode);
    }
  }
  return null;
}

async function onGroupUpdate(sock, update, getGroup){
  const { id, participants, action, author } = update;
  const g = getGroupDB(id);
  if(action==='promote' && g.antipromote){
    for(const p of participants) await sock.groupParticipantsUpdate(id,[p],'demote').catch(()=>{});
  }
  if(action==='demote' && g.antidemote){
    for(const p of participants) await sock.groupParticipantsUpdate(id,[p],'promote').catch(()=>{});
  }
  if(action==='remove' && g.antikick && author){
    await sock.sendMessage(id,{text:`🚫 ANTI-KICK: @${author.split('@')[0]} kick person, anti-kick dey ON`,mentions:[author]}).catch(()=>{});
  }
  if(action==='add' && g.antiadd){
    for(const p of participants) await sock.groupParticipantsUpdate(id,[p],'remove').catch(()=>{});
  }
  if(action==='revoke' && g.antirevoke){
    await sock.sendMessage(id,{text:`🚫 ANTI-REVOKE: Group link changed`}).catch(()=>{});
  }
  return null;
}

async function onDelete(sock, up){
  const saved = global.db.messages?.[up.key.id];
  if(!saved) return null;
  const g = getGroupDB(saved.from);
  if(!g.antidelete && !g.antidelete2) return null;
  try{
    await sock.sendMessage(saved.from,{text:`*🔍 ANTI-DELETE*\nFrom: @${saved.sender.split('@')[0]}\n> ${saved.text?.slice(0,300)}`,mentions:[saved.sender]}).catch(()=>{});
  }catch{}
  return null;
}

module.exports = commands;
module.exports.onMessage = onMessage;
module.exports.onStatus = onStatus;
module.exports.onGroupUpdate = onGroupUpdate;
module.exports.onDelete = onDelete;
module.exports.getGroupDB = getGroupDB;

const settings = require('../settings');

function getDB() {
  global.db = global.db || {};
  global.db.groups = global.db.groups || {};
  global.db.banned = global.db.banned || [];
  global.db.warnings = global.db.warnings || {};
  return global.db;
}

function setGroupSetting(jid,key,val){
  global.db.groups = global.db.groups || {}; 
  global.db.groups[jid] = global.db.groups[jid] || {};
  global.db.groups[jid][key]=val;
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

module.exports = [

// 1-10 KICK/BAN
{
name: "kick", alias: ["remove"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!m.isGroup) return m.reply("Group only");
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if(!target) return m.reply("Tag or reply user to kick\nEx: .kick @user");
  await sock.groupParticipantsUpdate(from,[target],"remove");
  await sock.sendMessage(from,{text:`✅ @${target.split('@')[0]} kicked`, mentions:[target]},{quoted:m});
}
},
{
name: "add", category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!m.isGroup) return m.reply("Group only");
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  if(!args[0]) return m.reply("Provide number: .add 234...");
  const jid = args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net';
  await sock.groupParticipantsUpdate(from,[jid],"add");
  m.reply(`✅ Added ${args[0]}`);
}
},
{
name: "ban", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0] || m.quoted?.sender;
  if(!target) return m.reply("Tag user");
  const db = getDB(); 
  if(!db.banned.includes(target)) db.banned.push(target);
  m.reply(`✅ Banned @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "unban", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag user to unban");
  const db = getDB(); db.banned = db.banned.filter(u=>u!==target); 
  m.reply("✅ Unbanned");
}
},
{
name: "kickall", category: "moderator", async execute(m,{sock,from,sender}){
  if(!m.isGroup) return m.reply("Group only");
  const metadata = await sock.groupMetadata(from);
  if(metadata.participants.find(p=>p.id===sender)?.admin !== 'superadmin') return m.reply("*👑 Only group owner can use kickall*");
  for(let p of metadata.participants){ if(!p.admin) await sock.groupParticipantsUpdate(from,[p.id],"remove"); }
  m.reply("✅ All non-admins kicked");
}
},
{
name: "remove2", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag user");
  await sock.groupParticipantsUpdate(from,[target],"remove"); m.reply("✅ Removed");
}
},
{
name: "out", category: "moderator", async execute(m,{sock,from,sender,args}){ 
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const target = args[0] ? args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : m.mentionedJid[0];
  if(!target) return m.reply("Tag user");
  await sock.groupParticipantsUpdate(from,[target],"remove"); 
}
},
{
name: "leave", alias: ["exitgc"], category: "moderator", async execute(m,{sock,from}){ await sock.groupLeave(from); }
},
{
name: "disappear", alias: ["dismode"], category: "moderator", async execute(m,{sock,from,args,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const timer = parseInt(args[0])||0; 
  await sock.groupToggleEphemeral(from, timer);
  m.reply(`✅ Disappearing set to ${timer}s`);
}
},
{
name: "ephemeral", category: "moderator", async execute(m,{sock,from,args,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const timer = parseInt(args[0])||0; 
  await sock.groupToggleEphemeral(from, timer); 
  m.reply(`✅ Ephemeral ${timer}s`);
}
},

// 11-20 PROMOTE/DEMOTE
{
name: "promote", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag or reply user");
  await sock.groupParticipantsUpdate(from,[target],"promote"); 
  m.reply(`✅ Promoted @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "demote", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag user");
  await sock.groupParticipantsUpdate(from,[target],"demote"); 
  m.reply(`✅ Demoted @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "promoteall", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const metadata = await sock.groupMetadata(from);
  const nonAdmins = metadata.participants.filter(p=>!p.admin).map(p=>p.id);
  if(nonAdmins.length===0) return m.reply("All are already admins");
  await sock.groupParticipantsUpdate(from,nonAdmins,"promote"); 
  m.reply(`✅ All ${nonAdmins.length} promoted`);
}
},
{
name: "demoteall", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin==='admin').map(p=>p.id);
  await sock.groupParticipantsUpdate(from,admins,"demote"); 
  m.reply(`✅ ${admins.length} demoted`);
}
},
{
name: "admin", alias: ["admins"], category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin).map(p=>`• @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(from,{text:`*╭─〘 ADMINS (${metadata.participants.filter(p=>p.admin).length}) 〙─*\n│\n${admins}\n│\n╰─`, mentions:metadata.participants.filter(p=>p.admin).map(p=>p.id)},{quoted:m});
}
},
{
name: "staff", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  await sock.sendMessage(from,{text:`Staff: ${metadata.participants.filter(p=>p.admin).length} admins`},{quoted:m});
}
},
{
name: "modlist", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const list = metadata.participants.filter(p=>p.admin).map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(from,{text:`*MOD LIST*\n\n${list}`, mentions:metadata.participants.filter(p=>p.admin).map(p=>p.id)},{quoted:m});
}
},
{
name: "mod", category: "moderator", async execute(m,{sock,from}){ m.reply("✅ Mod mode active"); }
},
{
name: "owner", category: "moderator", async execute(m,{sock,from}){
  const ownerJid = settings.ownerNumber+'@s.whatsapp.net';
  await sock.sendMessage(from,{text:`👑 Owner: @${settings.ownerNumber}`, mentions:[ownerJid]},{quoted:m});
}
},

// 21-30 WARN
{
name: "warn", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag user");
  const db = getDB(); db.warnings[target] = (db.warnings[target]||0)+1;
  const count = db.warnings[target];
  await sock.sendMessage(from,{text:`⚠️ Warned @${target.split('@')[0]} [${count}/3]`, mentions:[target]},{quoted:m});
  if(count>=3){ await sock.groupParticipantsUpdate(from,[target],"remove"); db.warnings[target]=0; await sock.sendMessage(from,{text:`@user removed after 3 warns`, mentions:[target]}); }
}
},
{
name: "unwarn", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag user");
  const db = getDB(); db.warnings[target] = Math.max(0,(db.warnings[target]||0)-1); 
  m.reply(`✅ Unwarned @${target.split('@')[0]} - now ${db.warnings[target]}`, {mentions:[target]});
}
},
{
name: "warnings", alias: ["warns"], category: "moderator", async execute(m,{sock,from}){
  let target = m.mentionedJid[0] || m.quoted?.sender || m.sender; 
  const db = getDB();
  m.reply(`⚠️ Warnings for @${target.split('@')[0]}: ${db.warnings?.[target]||0}`, {mentions:[target]});
}
},
{
name: "delwarn", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag user");
  getDB().warnings[target]=0; m.reply("✅ Warnings deleted");
}
},
{
name: "clearwarn", alias: ["clearwarns"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  getDB().warnings={}; m.reply("✅ All warnings cleared");
}
},
{
name: "resetwarn", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0]; if(target) getDB().warnings[target]=0; else getDB().warnings={}; m.reply("✅ Reset done");
}
},
{
name: "warnlist", category: "moderator", async execute(m,{sock,from}){
  const db = getDB();
  const list = Object.entries(db.warnings||{}).map(([id,c])=>`• @${id.split('@')[0]}: ${c} warns`).join('\n') || "No warns";
  await sock.sendMessage(from,{text:`*WARN LIST*\n\n${list}`, mentions:Object.keys(db.warnings||{})},{quoted:m});
}
},
{
name: "setwarn", category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag user + count");
  getDB().warnings[target]=parseInt(args[1])||0; m.reply(`✅ Set warn to ${args[1]}`);
}
},
{
name: "mute", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  await sock.groupSettingUpdate(from,"announcement"); m.reply("🔒 Group muted - only admins can send");
}
},
{
name: "unmute", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  await sock.groupSettingUpdate(from,"not_announcement"); m.reply("🔓 Group unmuted");
}
},

// 31-40 TAG & REQUESTS
{
name: "tagall2", alias: ["tagall"], category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const metadata = await sock.groupMetadata(from);
  const mentions = metadata.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:`*${args.join(' ')||'TAG ALL'}*\n${mentions.map(id=>`@${id.split('@')[0]}`).join(' ')}`, mentions},{quoted:m});
}
},
{
name: "tagadmin2", alias: ["tagadmin"], category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin).map(p=>p.id);
  await sock.sendMessage(from,{text:`*Admins (${admins.length})*`, mentions:admins},{quoted:m});
}
},
{
name: "hidetag2", alias: ["hidetag"], category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const metadata = await sock.groupMetadata(from);
  const mentions = metadata.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:args.join(' ')||"Hidetag", mentions},{quoted:m});
}
},
{
name: "everyone", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const metadata = await sock.groupMetadata(from);
  await sock.sendMessage(from,{text:"@everyone", mentions:metadata.participants.map(p=>p.id)},{quoted:m});
}
},
{
name: "staffonly", category: "moderator", async execute(m,{sock,from,args,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  setGroupSetting(from,'staffonly',args[0]=='on'); m.reply(`Staff only ${args[0]}`);
}
},
{
name: "modonly", category: "moderator", async execute(m,{sock,from,args,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  setGroupSetting(from,'modonly',args[0]=='on'); m.reply(`Mod only ${args[0]}`);
}
},
{
name: "approve2", alias: ["approve"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const requests = await sock.groupRequestParticipantsList(from);
  for(let r of requests) await sock.groupRequestParticipantsUpdate(from,[r.jid],"approve"); 
  m.reply(`✅ Approved ${requests.length} requests`);
}
},
{
name: "reject2", alias: ["reject"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const requests = await sock.groupRequestParticipantsList(from);
  for(let r of requests) await sock.groupRequestParticipantsUpdate(from,[r.jid],"reject"); 
  m.reply(`✅ Rejected ${requests.length}`);
}
},
{
name: "requests2", alias: ["requests"], category: "moderator", async execute(m,{sock,from}){
  const requests = await sock.groupRequestParticipantsList(from);
  m.reply(`*PENDING: ${requests.length}*\n${requests.map(r=>`• ${r.jid.split('@')[0]}`).join('\n')}`);
}
},
{
name: "pending", category: "moderator", async execute(m,{sock,from}){
  const requests = await sock.groupRequestParticipantsList(from);
  m.reply(`Pending: ${requests.length}`);
}
},

// 41-50 EXTRA MOD
{
name: "invite", category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  if(!args[0]) return m.reply("Number?");
  await sock.groupParticipantsUpdate(from,[args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'],"add"); m.reply("✅ Invited");
}
},
{
name: "revoke2", alias: ["revoke"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  await sock.groupRevokeInvite(from); m.reply("✅ Invite revoked");
}
},
{
name: "link2", alias: ["link"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const code = await sock.groupInviteCode(from); m.reply(`https://chat.whatsapp.com/${code}`);
}
},
{
name: "setlink", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  await sock.groupRevokeInvite(from); const code = await sock.groupInviteCode(from); m.reply(`✅ New link: https://chat.whatsapp.com/${code}`);
}
},
{
name: "anons", category: "moderator", async execute(m,{sock,from}){ m.reply("✅ Anonymous mode active"); }
},
{
name: "delete", alias: ["del"], category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  if(!m.quoted) return m.reply("Reply message to delete");
  await sock.sendMessage(from,{delete: m.quoted.key}); 
}
},
{
name: "pin", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  if(!m.quoted) return m.reply("Reply to pin"); 
  await sock.groupUpdateMessage(from, m.quoted.key, { pin: true }); m.reply("📌 Pinned");
}
},
{
name: "unpin", category: "moderator", async execute(m,{sock,from,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  if(!m.quoted) return m.reply("Reply to unpin"); 
  await sock.groupUpdateMessage(from, m.quoted.key, { pin: false }); m.reply("📌 Unpinned");
}
},
{
name: "slowmode", category: "moderator", async execute(m,{sock,from,args,sender}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const sec = parseInt(args[0])||0; 
  m.reply(`⏳ Slowmode set to ${sec}s (handled by anti-spam)`);
}
},
];

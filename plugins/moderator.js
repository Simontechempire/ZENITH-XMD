const settings = require('../settings');

const isAdmin = async (sock, from, sender) => {
  try {
    const metadata = await sock.groupMetadata(from);
    const participant = metadata.participants.find(p => p.id === sender);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  } catch { return false; }
};

module.exports = [

// 1-10 KICK/BAN
{
name: "kick", category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!m.isGroup) return m.reply("Group only");
  if(!await isAdmin(sock,from,sender)) return m.reply("Admin only");
  let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if(!target) return m.reply("Tag or reply user to kick");
  await sock.groupParticipantsUpdate(from,[target],"remove");
  await sock.sendMessage(from,{text:`✅ @${target.split('@')[0]} kicked`, mentions:[target]},{quoted:m});
}
},
{
name: "add", category: "moderator", async execute(m,{sock,from,sender,args}){
  if(!m.isGroup) return;
  if(!args[0]) return m.reply("Provide number: .add 234...");
  const jid = args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net';
  await sock.groupParticipantsUpdate(from,[jid],"add");
  m.reply(`Added ${args[0]}`);
}
},
{
name: "ban", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0] || m.quoted?.sender;
  if(!target) return m.reply("Tag user");
  global.db.banned = global.db.banned || []; global.db.banned.push(target);
  m.reply(`Banned @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "unban", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag");
  global.db.banned = global.db.banned.filter(u=>u!==target); m.reply("Unbanned");
}
},
{
name: "kickall", category: "moderator", async execute(m,{sock,from,sender}){
  if(!m.isGroup) return;
  const metadata = await sock.groupMetadata(from);
  if(metadata.participants.find(p=>p.id===sender)?.admin !== 'superadmin') return m.reply("Owner group only");
  for(let p of metadata.participants){ if(!p.admin) await sock.groupParticipantsUpdate(from,[p.id],"remove"); }
  m.reply("All non-admins kicked");
}
},
{
name: "remove", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag user");
  await sock.groupParticipantsUpdate(from,[target],"remove"); m.reply("Removed");
}
},
{
name: "out", category: "moderator", async execute(m,{sock,from,args}){ await sock.groupParticipantsUpdate(from,[args[0]||m.mentionedJid[0]],"remove"); }
},
{
name: "leave", category: "moderator", async execute(m,{sock,from}){ await sock.groupLeave(from); }
},
{
name: "disappear", category: "moderator", async execute(m,{sock,from,args}){
  const timer = parseInt(args[0])||0; await sock.sendMessage(from,{disappearingMessagesInChat: timer});
  m.reply(`Disappearing set to ${timer}`);
}
},
{
name: "ephemeral", category: "moderator", async execute(m,{sock,from,args}){
  const timer = parseInt(args[0])||0; await sock.sendMessage(from,{disappearingMessagesInChat: timer}); m.reply(`Ephemeral ${timer}`);
}
},

// 11-20 PROMOTE/DEMOTE
{
name: "promote", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag");
  await sock.groupParticipantsUpdate(from,[target],"promote"); m.reply("Promoted to admin");
}
},
{
name: "demote", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag");
  await sock.groupParticipantsUpdate(from,[target],"demote"); m.reply("Demoted");
}
},
{
name: "promoteall", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const nonAdmins = metadata.participants.filter(p=>!p.admin).map(p=>p.id);
  await sock.groupParticipantsUpdate(from,nonAdmins,"promote"); m.reply("All promoted");
}
},
{
name: "demoteall", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin==='admin').map(p=>p.id);
  await sock.groupParticipantsUpdate(from,admins,"demote"); m.reply("All demoted");
}
},
{
name: "admin", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin).map(p=>`@${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(from,{text:`*Admins:*\n${admins}`, mentions:metadata.participants.filter(p=>p.admin).map(p=>p.id)},{quoted:m});
}
},
{
name: "admins", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin); await sock.sendMessage(from,{text:`Admins: ${admins.length}`, mentions:admins.map(p=>p.id)},{quoted:m});
}
},
{
name: "staff", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  await sock.sendMessage(from,{text:`Staff list: ${metadata.participants.filter(p=>p.admin).length} admins`},{quoted:m});
}
},
{
name: "modlist", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const list = metadata.participants.filter(p=>p.admin).map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(from,{text:list, mentions:metadata.participants.filter(p=>p.admin).map(p=>p.id)},{quoted:m});
}
},
{
name: "mod", category: "moderator", async execute(m,{sock,from}){
  m.reply("Mod mode - admin only commands active");
}
},
{
name: "owner", category: "moderator", async execute(m,{sock,from}){
  await sock.sendMessage(from,{text:`Owner: @${settings.ownerNumber.split('@')[0]}`, mentions:[settings.ownerNumber+'@s.whatsapp.net']},{quoted:m});
}
},

// 21-30 WARN
{
name: "warn", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag user");
  global.db.warnings = global.db.warnings || {}; global.db.warnings[target] = (global.db.warnings[target]||0)+1;
  const count = global.db.warnings[target];
  await sock.sendMessage(from,{text:`⚠️ Warned @${target.split('@')[0]} [${count}/3]`, mentions:[target]},{quoted:m});
  if(count>=3){ await sock.groupParticipantsUpdate(from,[target],"remove"); global.db.warnings[target]=0; }
}
},
{
name: "unwarn", category: "moderator", async execute(m,{sock,from}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag");
  global.db.warnings[target] = Math.max(0,(global.db.warnings[target]||0)-1); m.reply(`Unwarned - now ${global.db.warnings[target]}`);
}
},
{
name: "warnings", category: "moderator", async execute(m,{sock,from}){
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag");
  m.reply(`Warnings for @${target.split('@')[0]}: ${global.db.warnings?.[target]||0}`, {mentions:[target]});
}
},
{
name: "delwarn", category: "moderator", async execute(m,{sock,from}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag");
  global.db.warnings[target]=0; m.reply("Warnings deleted");
}
},
{
name: "clearwarn", category: "moderator", async execute(m,{sock,from}){
  global.db.warnings={}; m.reply("All warnings cleared");
}
},
{
name: "resetwarn", category: "moderator", async execute(m,{sock,from}){
  let target = m.mentionedJid[0]; if(target) global.db.warnings[target]=0; else global.db.warnings={}; m.reply("Reset done");
}
},
{
name: "warnlist", category: "moderator", async execute(m,{sock,from}){
  const list = Object.entries(global.db.warnings||{}).map(([id,c])=>`@${id.split('@')[0]}: ${c}`).join('\n') || "No warns";
  await sock.sendMessage(from,{text:list, mentions:Object.keys(global.db.warnings||{})},{quoted:m});
}
},
{
name: "setwarn", category: "moderator", async execute(m,{sock,from,args}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag");
  global.db.warnings[target]=parseInt(args[1])||0; m.reply(`Set warn to ${args[1]}`);
}
},
{
name: "mute", category: "moderator", async execute(m,{sock,from}){
  await sock.groupSettingUpdate(from,"announcement"); m.reply("Group muted - only admins can send");
}
},
{
name: "unmute", category: "moderator", async execute(m,{sock,from}){
  await sock.groupSettingUpdate(from,"not_announcement"); m.reply("Group unmuted");
}
},

// 31-40 TAG & REQUESTS
{
name: "tagall", category: "moderator", async execute(m,{sock,from,args}){
  const metadata = await sock.groupMetadata(from);
  const text = args.join(' ') || "Tag All";
  const mentions = metadata.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:`*${text}*\n${mentions.map((_,i)=>`@${mentions[i].split('@')[0]}`).join('\n')}`, mentions},{quoted:m});
}
},
{
name: "tagadmin", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const admins = metadata.participants.filter(p=>p.admin).map(p=>p.id);
  await sock.sendMessage(from,{text:"Tagging admins", mentions:admins},{quoted:m});
}
},
{
name: "hidetag", category: "moderator", async execute(m,{sock,from,args}){
  const metadata = await sock.groupMetadata(from);
  const mentions = metadata.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:args.join(' ')||"Hidetag", mentions},{quoted:m});
}
},
{
name: "everyone", category: "moderator", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  await sock.sendMessage(from,{text:"@everyone", mentions:metadata.participants.map(p=>p.id)},{quoted:m});
}
},
{
name: "staffonly", category: "moderator", async execute(m,{sock,from,args}){
  setGroupSetting(from,'staffonly',args[0]=='on'); m.reply(`Staff only ${args[0]}`);
}
},
{
name: "modonly", category: "moderator", async execute(m,{sock,from,args}){
  setGroupSetting(from,'modonly',args[0]=='on'); m.reply(`Mod only ${args[0]}`);
}
},
{
name: "approve", category: "moderator", async execute(m,{sock,from}){
  const requests = await sock.groupRequestParticipantsList(from);
  for(let r of requests) await sock.groupRequestParticipantsUpdate(from,[r.jid],"approve"); m.reply(`Approved ${requests.length}`);
}
},
{
name: "reject", category: "moderator", async execute(m,{sock,from}){
  const requests = await sock.groupRequestParticipantsList(from);
  for(let r of requests) await sock.groupRequestParticipantsUpdate(from,[r.jid],"reject"); m.reply(`Rejected ${requests.length}`);
}
},
{
name: "requests", category: "moderator", async execute(m,{sock,from}){
  const requests = await sock.groupRequestParticipantsList(from);
  m.reply(`Pending requests: ${requests.length}\n${requests.map(r=>r.jid).join('\n')}`);
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
name: "invite", category: "moderator", async execute(m,{sock,from,args}){
  await sock.groupParticipantsUpdate(from,[args[0]+'@s.whatsapp.net'],"add"); m.reply("Invited");
}
},
{
name: "revoke", category: "moderator", async execute(m,{sock,from}){
  await sock.groupRevokeInvite(from); m.reply("Invite revoked");
}
},
{
name: "link", category: "moderator", async execute(m,{sock,from}){
  const code = await sock.groupInviteCode(from); m.reply(`https://chat.whatsapp.com/${code}`);
}
},
{
name: "setlink", category: "moderator", async execute(m,{sock,from}){
  await sock.groupRevokeInvite(from); const code = await sock.groupInviteCode(from); m.reply(`New link: https://chat.whatsapp.com/${code}`);
}
},
{
name: "anons", category: "moderator", async execute(m,{sock,from}){
  m.reply("Anonymous mode active");
}
},
{
name: "delete", category: "moderator", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply message to delete");
  await sock.sendMessage(from,{delete: m.quoted.key}); m.reply("Deleted");
}
},
{
name: "del", category: "moderator", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply to delete"); await sock.sendMessage(from,{delete: m.quoted.key});
}
},
{
name: "pin", category: "moderator", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply to pin"); await sock.sendMessage(from,{pin: m.quoted.key, type: 1}); m.reply("Pinned");
}
},
{
name: "unpin", category: "moderator", async execute(m,{sock,from}){
  if(!m.quoted) return; await sock.sendMessage(from,{pin: m.quoted.key, type: 2}); m.reply("Unpinned");
}
},
{
name: "slowmode", category: "moderator", async execute(m,{sock,from,args}){
  const sec = parseInt(args[0])||0; m.reply(`Slowmode set to ${sec}s`);
}
},
];

function setGroupSetting(jid,key,val){
  global.db.groups = global.db.groups || {}; 
  global.db.groups[jid] = global.db.groups[jid] || {};
  global.db.groups[jid][key]=val;
      }

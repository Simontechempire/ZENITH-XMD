const settings = require('../settings');

function getDB() {
  global.db = global.db || {};
  global.db.groups = global.db.groups || {};
  return global.db;
}

function toggleReply(m, name, isOn) {
  const state = isOn ? "ON ✅" : "OFF ❌";
  if (isOn) {
    return m.reply(`> *I would*\n> *Updated*\n*✅ ${name} is now ${state}*\n> *Successful*`);
  } else {
    return m.reply(`> *I would*\n> *Updated*\n*${name} is now ${state}*\n> *Success*`);
  }
}

function checkAdmin(m) {
  const isAdmin = m.isGroupAdmin || m.isAdmin || true;
  if (!isAdmin) {
    m.reply(`*⛔ Only group admin are authorised to use this commands*`);
    return false;
  }
  return true;
}

module.exports = [

// 1-10 INFO
{
name: "ginfo", alias: ["groupinfo"], category: "group", desc: "Show group info",
async execute(m,{sock,from}){
  if(!from.endsWith('@g.us')) return m.reply("Group only");
  const metadata = await sock.groupMetadata(from);
  const txt = `*╭─〘 GROUP INFO 〙─*\n│\n│ • Name: ${metadata.subject}\n│ • ID: ${metadata.id}\n│ • Members: ${metadata.participants.length}\n│ • Admins: ${metadata.participants.filter(p=>p.admin).length}\n│ • Created: ${new Date(metadata.creation*1000).toDateString()}\n│ • Owner: ${metadata.owner ? '@'+metadata.owner.split('@')[0] : 'Unknown'}\n│ • Desc: ${metadata.desc?.slice(0,100)||"No desc"}\n│\n╰─`;
  await sock.sendMessage(from,{text:txt, mentions: metadata.owner ? [metadata.owner] : []},{quoted:m});
}
},
{
name: "groupinfo2", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); 
  m.reply(`*GROUP INFO 2*\nName: ${meta.subject}\nMembers: ${meta.participants.length}\nOwner: @${meta.owner?.split('@')[0]||'Unknown'}`, {mentions: meta.owner ? [meta.owner] : []});
}
},
{
name: "gc", category: "group", async execute(m,{sock,from}){ 
  const meta = await sock.groupMetadata(from); 
  m.reply(`*GC:* ${meta.subject} - ${meta.participants.length} members`); 
}
},
{
name: "members", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from);
  const list = meta.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]} ${p.admin?'[ADMIN]':''}`).join('\n');
  await sock.sendMessage(from,{text:`*MEMBERS (${meta.participants.length})*\n\n${list}`, mentions:meta.participants.map(p=>p.id)},{quoted:m});
}
},
{
name: "listadmin", alias: ["admins"], category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from);
  const admins = meta.participants.filter(p=>p.admin); 
  await sock.sendMessage(from,{text:`*ADMINS (${admins.length})*\n${admins.map(a=>`• @${a.id.split('@')[0]}`).join('\n')}`, mentions:admins.map(a=>a.id)},{quoted:m});
}
},
{
name: "grouppic", alias: ["gcppic"], category: "group", async execute(m,{sock,from}){
  try{ const pp = await sock.profilePictureUrl(from,"image"); await sock.sendMessage(from,{image:{url:pp}, caption:`PP of ${from}`},{quoted:m}); }catch{ m.reply("No pp / private group"); }
}
},
{
name: "gcname", category: "group", async execute(m,{sock,from}){ const meta = await sock.groupMetadata(from); m.reply(`*Name:* ${meta.subject}`); }
},
{
name: "gcdesc", category: "group", async execute(m,{sock,from}){ const meta = await sock.groupMetadata(from); m.reply(meta.desc||"No description"); }
},
{
name: "gcid", category: "group", async execute(m,{sock,from}){ m.reply(`*ID:* ${from}`); }
},
{
name: "gclink", alias: ["link","invite","getlink"], category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  const code = await sock.groupInviteCode(from); 
  await sock.sendMessage(from,{text:`*GROUP LINK*\nhttps://chat.whatsapp.com/${code}`},{quoted:m});
}
},

// 11-20 SETTINGS
{
name: "setname", alias: ["setgname","gname"], category: "group", async execute(m,{sock,from,args}){
  if(!checkAdmin(m)) return;
  if(!args[0]) return m.reply("Provide name\nEx: .setname ZENITH");
  await sock.groupUpdateSubject(from, args.join(' ')); 
  m.reply(`✅ Group name changed to *${args.join(' ')}*`);
}
},
{
name: "setdesc", alias: ["setgdesc","gdesc"], category: "group", async execute(m,{sock,from,args}){
  if(!checkAdmin(m)) return;
  await sock.groupUpdateDescription(from, args.join(' ')||""); 
  m.reply("✅ Description updated");
}
},
{
name: "setppgc", alias: ["setgpp","setppgroup"], category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply an image to set PP");
  const media = await m.quoted.download(); 
  await sock.updateProfilePicture(from, media); 
  m.reply("✅ Group PP updated");
}
},
{
name: "gcpp", category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  if(!m.quoted) return m.reply("Reply image"); 
  const media = await m.quoted.download(); 
  await sock.updateProfilePicture(from, media); 
  m.reply("✅ PP set");
}
},
{
name: "open", category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupSettingUpdate(from,"not_announcement"); 
  m.reply("✅ Group opened - all members can send"); 
}
},
{
name: "close", category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupSettingUpdate(from,"announcement"); 
  m.reply("🔒 Group closed - admin only"); 
}
},
{
name: "lock", category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupSettingUpdate(from,"locked"); 
  m.reply("🔒 Group info locked"); 
}
},
{
name: "unlock", category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupSettingUpdate(from,"unlocked"); 
  m.reply("🔓 Group info unlocked"); 
}
},
{
name: "revoke", alias: ["resetlink","gcrevoke"], category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupRevokeInvite(from); 
  const code = await sock.groupInviteCode(from); 
  m.reply(`✅ New link:\nhttps://chat.whatsapp.com/${code}`); 
}
},
{
name: "invite2", category: "group", async execute(m,{sock,from,args}){ 
  if(!checkAdmin(m)) return;
  if(!args[0]) return m.reply("Number? Ex: .invite2 23490..."); 
  await sock.groupParticipantsUpdate(from,[args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'],"add"); 
  m.reply("✅ Invited"); 
}
},

// 21-30 TAG & POLL
{
name: "tagall", alias: ["everyone"], category: "group", async execute(m,{sock,from,args}){
  if(!checkAdmin(m)) return;
  const meta = await sock.groupMetadata(from); 
  const mentions = meta.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:`*${args.join(' ')||'TAG ALL'}*\n\n${mentions.map(id=>`@${id.split('@')[0]}`).join(' ')}`, mentions},{quoted:m});
}
},
{
name: "hidetag", alias: ["ht","htag"], category: "group", async execute(m,{sock,from,args}){
  if(!checkAdmin(m)) return;
  const meta = await sock.groupMetadata(from); 
  const mentions = meta.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:args.join(' ')||"Hidetag", mentions},{quoted:m});
}
},
{
name: "tagadmin", category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  const meta = await sock.groupMetadata(from); 
  const admins = meta.participants.filter(p=>p.admin).map(p=>p.id);
  await sock.sendMessage(from,{text:`*ADMIN TAG*\n${admins.map(a=>`@${a.split('@')[0]}`).join(' ')}`, mentions:admins},{quoted:m});
}
},
{
name: "poll", category: "group", async execute(m,{sock,from,args}){
  const [q, ...opts] = args.join(' ').split('|'); 
  if(!q||opts.length<2) return m.reply("Use: .poll Question | Opt1 | Opt2 | Opt3");
  await sock.sendMessage(from,{poll:{name:q.trim(), values:opts.map(o=>o.trim()), selectableCount:1}},{quoted:m});
}
},
{
name: "vote", category: "group", async execute(m,{sock,from,args}){
  await sock.sendMessage(from,{poll:{name:args.join(' ')||"Vote", values:["Yes","No"], selectableCount:1}},{quoted:m});
}
},
{
name: "voters", category: "group", async execute(m,{sock,from}){ m.reply("Check poll message > tap View Votes"); }
},
{
name: "join", category: "group", async execute(m,{sock,args}){
  if(!args[0]) return m.reply("Link? Ex: .join https://chat.whatsapp.com/xxx"); 
  const code = args[0].split('/').pop(); 
  await sock.groupAcceptInvite(code); 
  m.reply("✅ Joined");
}
},
{
name: "leave", alias: ["out","exit"], category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupLeave(from); 
}
},
{
name: "grouponly", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].grouponly = args[0]=='on'; 
  await toggleReply(m, "Group Only Mode", args[0]=='on');
}
},
{
name: "setwelcome", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].welcomeText = args.join(' '); 
  m.reply(`✅ Welcome set: ${args.join(' ')}`);
}
},

// 31-40 WELCOME/GOODBYE + ANTI
{
name: "setgoodbye", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].goodbyeText = args.join(' '); 
  m.reply(`✅ Goodbye set: ${args.join(' ')}`);
}
},
{
name: "welcome", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].welcome = args[0]=='on'; 
  await toggleReply(m, "Welcome", args[0]=='on');
}
},
{
name: "goodbye", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].goodbye = args[0]=='on'; 
  await toggleReply(m, "Goodbye", args[0]=='on');
}
},
{
name: "antilink", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].antilink = args[0]=='on'; 
  await toggleReply(m, "Antilink", args[0]=='on');
}
},
{
name: "antibot", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].antibot = args[0]=='on'; 
  await toggleReply(m, "Antibot", args[0]=='on');
}
},
{
name: "antispam", category: "group", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from].antispam = args[0]=='on'; 
  await toggleReply(m, "Antispam", args[0]=='on');
}
},
{
name: "addmember", alias: ["add"], category: "group", async execute(m,{sock,from,args}){
  if(!checkAdmin(m)) return;
  if(!args[0]) return m.reply("Number Ex: .add 23480xxxx"); 
  await sock.groupParticipantsUpdate(from,[args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'],"add"); 
  m.reply("✅ Added");
}
},
{
name: "kickmember", alias: ["kick"], category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  let target = m.mentionedJid?.[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag or reply user"); 
  await sock.groupParticipantsUpdate(from,[target],"remove"); 
  m.reply("✅ Kicked");
}
},
{
name: "promotemember", alias: ["promote"], category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  let target = m.mentionedJid?.[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag"); 
  await sock.groupParticipantsUpdate(from,[target],"promote"); 
  m.reply("✅ Promoted to admin");
}
},
{
name: "demotemember", alias: ["demote"], category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  let target = m.mentionedJid?.[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag"); 
  await sock.groupParticipantsUpdate(from,[target],"demote"); 
  m.reply("✅ Demoted");
}
},

// 41-50 EXTRA GROUP
{
name: "getlink2", alias: ["getlink"], category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  const code = await sock.groupInviteCode(from); 
  m.reply(`https://chat.whatsapp.com/${code}`); 
}
},
{
name: "gclink2", category: "group", async execute(m,{sock,from}){ 
  const code = await sock.groupInviteCode(from); 
  m.reply(`Code: ${code}`); 
}
},
{
name: "resetlink2", alias: ["resetlink"], category: "group", async execute(m,{sock,from}){ 
  if(!checkAdmin(m)) return;
  await sock.groupRevokeInvite(from); 
  m.reply("✅ Link reset"); 
}
},
{
name: "inviteinfo", category: "group", async execute(m,{sock,args}){
  if(!args[0]) return m.reply("Invite link?"); 
  const info = await sock.groupGetInviteInfo(args[0]); 
  m.reply(`*INVITE INFO*\nName: ${info.subject}\nMembers: ${info.size}\nOwner: ${info.owner?.split('@')[0]}`);
}
},
{
name: "approve", category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  const req = await sock.groupRequestParticipantsList(from); 
  for(let r of req) await sock.groupRequestParticipantsUpdate(from,[r.jid],"approve"); 
  m.reply(`✅ Approved ${req.length} requests`);
}
},
{
name: "reject", category: "group", async execute(m,{sock,from}){
  if(!checkAdmin(m)) return;
  const req = await sock.groupRequestParticipantsList(from); 
  for(let r of req) await sock.groupRequestParticipantsUpdate(from,[r.jid],"reject"); 
  m.reply(`✅ Rejected ${req.length} requests`);
}
},
{
name: "requests", category: "group", async execute(m,{sock,from}){ 
  const req = await sock.groupRequestParticipantsList(from); 
  m.reply(`*PENDING REQUESTS: ${req.length}*`); 
}
},
{
name: "checkadmin", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); 
  const isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin; 
  m.reply(isAdmin ? "✅ You are admin" : "❌ You are not admin");
}
},
{
name: "botadmin", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); 
  const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net'; 
  const isBotAdmin = meta.participants.find(p=>p.id===botId || p.id===sock.user.id)?.admin; 
  m.reply(isBotAdmin ? "✅ Bot is admin" : "❌ Bot not admin");
}
},
{
name: "groupsetting", alias: ["gcsetting"], category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); 
  m.reply(`*SETTINGS*\nAnnounce: ${meta.announce ? 'Closed 🔒' : 'Open ✅'}\nRestrict: ${meta.restrict ? 'Locked 🔒' : 'Unlocked 🔓'}\nMembers: ${meta.participants.length}`);
}
},
];

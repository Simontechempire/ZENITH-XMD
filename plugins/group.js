module.exports = [

// 1-10 INFO
{
name: "ginfo", alias: ["groupinfo"], category: "group", async execute(m,{sock,from}){
  const metadata = await sock.groupMetadata(from);
  const txt = `*GROUP INFO*\n\nName: ${metadata.subject}\nID: ${metadata.id}\nMembers: ${metadata.participants.length}\nAdmins: ${metadata.participants.filter(p=>p.admin).length}\nCreated: ${new Date(metadata.creation*1000).toDateString()}\nDesc: ${metadata.desc||"No desc"}`;
  await sock.sendMessage(from,{text:txt},{quoted:m});
}
},
{
name: "groupinfo2", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); m.reply(`Name: ${meta.subject}\nMembers: ${meta.participants.length}\nOwner: ${meta.owner}`);
}
},
{
name: "gc", category: "group", async execute(m,{sock,from}){ const meta = await sock.groupMetadata(from); m.reply(`GC: ${meta.subject} - ${meta.participants.length} members`); }
},
{
name: "members", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from);
  const list = meta.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]} ${p.admin?'[ADMIN]':''}`).join('\n');
  await sock.sendMessage(from,{text:list, mentions:meta.participants.map(p=>p.id)},{quoted:m});
}
},
{
name: "listadmin", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from);
  const admins = meta.participants.filter(p=>p.admin); await sock.sendMessage(from,{text:`Admins (${admins.length}):\n${admins.map(a=>`@${a.id.split('@')[0]}`).join('\n')}`, mentions:admins.map(a=>a.id)},{quoted:m});
}
},
{
name: "grouppic", category: "group", async execute(m,{sock,from}){
  try{ const pp = await sock.profilePictureUrl(from,"image"); await sock.sendMessage(from,{image:{url:pp}, caption:"Group PP"},{quoted:m}); }catch{ m.reply("No pp or private"); }
}
},
{
name: "gcname", category: "group", async execute(m,{sock,from}){ const meta = await sock.groupMetadata(from); m.reply(meta.subject); }
},
{
name: "gcdesc", category: "group", async execute(m,{sock,from}){ const meta = await sock.groupMetadata(from); m.reply(meta.desc||"No description"); }
},
{
name: "gcid", category: "group", async execute(m,{sock,from}){ m.reply(`ID: ${from}`); }
},
{
name: "gclink", alias: ["link","invite","getlink"], category: "group", async execute(m,{sock,from}){
  const code = await sock.groupInviteCode(from); await sock.sendMessage(from,{text:`https://chat.whatsapp.com/${code}`},{quoted:m});
}
},

// 11-20 SETTINGS
{
name: "setname", alias: ["setgname","gname"], category: "group", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Provide name"); await sock.groupUpdateSubject(from, args.join(' ')); m.reply(`Group name changed to ${args.join(' ')}`);
}
},
{
name: "setdesc", alias: ["setgdesc","gdesc"], category: "group", async execute(m,{sock,from,args}){
  await sock.groupUpdateDescription(from, args.join(' ')||""); m.reply("Description updated");
}
},
{
name: "setppgc", alias: ["setgpp","setppgroup"], category: "group", async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply image to set pp");
  const media = await m.quoted.download(); await sock.updateProfilePicture(from, media); m.reply("Group PP updated");
}
},
{
name: "gcpp", category: "group", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply image"); const media = await m.quoted.download(); await sock.updateProfilePicture(from, media); m.reply("PP set");
}
},
{
name: "open", category: "group", async execute(m,{sock,from}){ await sock.groupSettingUpdate(from,"not_announcement"); m.reply("✅ Group opened - all members can send"); }
},
{
name: "close", category: "group", async execute(m,{sock,from}){ await sock.groupSettingUpdate(from,"announcement"); m.reply("🔒 Group closed - admin only"); }
},
{
name: "lock", category: "group", async execute(m,{sock,from}){ await sock.groupSettingUpdate(from,"locked"); m.reply("🔒 Group info locked"); }
},
{
name: "unlock", category: "group", async execute(m,{sock,from}){ await sock.groupSettingUpdate(from,"unlocked"); m.reply("🔓 Group info unlocked"); }
},
{
name: "revoke", alias: ["resetlink","gcrevoke"], category: "group", async execute(m,{sock,from}){ await sock.groupRevokeInvite(from); const code = await sock.groupInviteCode(from); m.reply(`New link: https://chat.whatsapp.com/${code}`); }
},
{
name: "invite2", category: "group", async execute(m,{sock,from,args}){ if(!args[0]) return m.reply("Number?"); await sock.groupParticipantsUpdate(from,[args[0]+'@s.whatsapp.net'],"add"); m.reply("Invited"); }
},

// 21-30 TAG & POLL
{
name: "tagall", alias: ["everyone"], category: "group", async execute(m,{sock,from,args}){
  const meta = await sock.groupMetadata(from); const mentions = meta.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:`*${args.join(' ')||'TAG ALL'}*\n${mentions.map(id=>`@${id.split('@')[0]}`).join(' ')}`, mentions},{quoted:m});
}
},
{
name: "hidetag", alias: ["ht","htag"], category: "group", async execute(m,{sock,from,args}){
  const meta = await sock.groupMetadata(from); const mentions = meta.participants.map(p=>p.id);
  await sock.sendMessage(from,{text:args.join(' ')||"Hidetag", mentions},{quoted:m});
}
},
{
name: "tagadmin", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); const admins = meta.participants.filter(p=>p.admin).map(p=>p.id);
  await sock.sendMessage(from,{text:"Admins tag", mentions:admins},{quoted:m});
}
},
{
name: "poll", category: "group", async execute(m,{sock,from,args}){
  const [q, ...opts] = args.join(' ').split('|'); if(!q||opts.length<2) return m.reply("Use: .poll Question | Opt1 | Opt2");
  await sock.sendMessage(from,{poll:{name:q, values:opts, selectableCount:1}},{quoted:m});
}
},
{
name: "vote", category: "group", async execute(m,{sock,from,args}){
  await sock.sendMessage(from,{poll:{name:args.join(' ')||"Vote", values:["Yes","No"], selectableCount:1}},{quoted:m});
}
},
{
name: "voters", category: "group", async execute(m,{sock,from}){ m.reply("Poll voters feature - check poll message"); }
},
{
name: "join", category: "group", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Link?"); const code = args[0].split('/').pop(); await sock.groupAcceptInvite(code); m.reply("Joined");
}
},
{
name: "leave", alias: ["out","exit"], category: "group", async execute(m,{sock,from}){ await sock.groupLeave(from); }
},
{
name: "grouponly", category: "group", async execute(m,{sock,from,args}){
  global.db.groups = global.db.groups||{}; global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].grouponly = args[0]=='on'; m.reply(`Group only ${args[0]}`);
}
},
{
name: "setwelcome", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].welcomeText = args.join(' '); m.reply(`Welcome set: ${args.join(' ')}`);
}
},

// 31-40 WELCOME/GOODBYE
{
name: "setgoodbye", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].goodbyeText = args.join(' '); m.reply(`Goodbye set: ${args.join(' ')}`);
}
},
{
name: "welcome", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].welcome = args[0]=='on'; m.reply(`Welcome ${args[0]}`);
}
},
{
name: "goodbye", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].goodbye = args[0]=='on'; m.reply(`Goodbye ${args[0]}`);
}
},
{
name: "antilink", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].antilink = args[0]=='on'; m.reply(`Antilink ${args[0]}`);
}
},
{
name: "antibot", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].antibot = args[0]=='on'; m.reply(`Antibot ${args[0]}`);
}
},
{
name: "antispam", category: "group", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].antispam = args[0]=='on'; m.reply(`Antispam ${args[0]}`);
}
},
{
name: "addmember", category: "group", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Number"); await sock.groupParticipantsUpdate(from,[args[0]+'@s.whatsapp.net'],"add"); m.reply("Added");
}
},
{
name: "kickmember", category: "group", async execute(m,{sock,from}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag"); await sock.groupParticipantsUpdate(from,[target],"remove"); m.reply("Kicked");
}
},
{
name: "promotemember", category: "group", async execute(m,{sock,from}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag"); await sock.groupParticipantsUpdate(from,[target],"promote"); m.reply("Promoted");
}
},
{
name: "demotemember", category: "group", async execute(m,{sock,from}){
  let target = m.mentionedJid[0]; if(!target) return m.reply("Tag"); await sock.groupParticipantsUpdate(from,[target],"demote"); m.reply("Demoted");
}
},

// 41-50 EXTRA GROUP
{
name: "getlink", category: "group", async execute(m,{sock,from}){ const code = await sock.groupInviteCode(from); m.reply(`https://chat.whatsapp.com/${code}`); }
},
{
name: "gclink2", category: "group", async execute(m,{sock,from}){ const code = await sock.groupInviteCode(from); m.reply(code); }
},
{
name: "resetlink", category: "group", async execute(m,{sock,from}){ await sock.groupRevokeInvite(from); m.reply("Link reset"); }
},
{
name: "inviteinfo", category: "group", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Invite link?"); const info = await sock.groupGetInviteInfo(args[0]); m.reply(`Name: ${info.subject}\nMembers: ${info.size}`);
}
},
{
name: "approve", category: "group", async execute(m,{sock,from}){
  const req = await sock.groupRequestParticipantsList(from); for(let r of req) await sock.groupRequestParticipantsUpdate(from,[r.jid],"approve"); m.reply(`Approved ${req.length}`);
}
},
{
name: "reject", category: "group", async execute(m,{sock,from}){
  const req = await sock.groupRequestParticipantsList(from); for(let r of req) await sock.groupRequestParticipantsUpdate(from,[r.jid],"reject"); m.reply(`Rejected ${req.length}`);
}
},
{
name: "requests", category: "group", async execute(m,{sock,from}){ const req = await sock.groupRequestParticipantsList(from); m.reply(`Requests: ${req.length}`); }
},
{
name: "checkadmin", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); const isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin; m.reply(isAdmin ? "You are admin" : "You are not admin");
}
},
{
name: "botadmin", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); const botId = sock.user.id; const isBotAdmin = meta.participants.find(p=>p.id===botId)?.admin; m.reply(isBotAdmin ? "Bot is admin ✅" : "Bot not admin ❌");
}
},
{
name: "groupsetting", category: "group", async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); m.reply(`Settings: Announce: ${meta.announce||false} Locked: ${meta.restrict||false}`);
}
},
];

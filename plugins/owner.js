const settings = require('../settings');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = [

// 1-10 CORE
{
name: "restart", alias: ["reboot"], category: "owner", async execute(m,{sock}){
  await sock.sendMessage(m.key.remoteJid,{text:"♻️ Restarting ZENITH-XMD..."},{quoted:m});
  process.exit(0);
}
},
{
name: "broadcast", alias: ["bc"], category: "owner", async execute(m,{sock,args}){
  if(!args[0]) return m.reply("Text to broadcast?");
  const groups = Object.keys(await sock.groupFetchAllParticipating());
  for(let g of groups){ await sock.sendMessage(g,{text:`*BROADCAST*\n\n${args.join(' ')}`}); }
  m.reply(`Broadcast sent to ${groups.length} groups`);
}
},
{
name: "bcgc", category: "owner", async execute(m,{sock,args}){
  const groups = Object.keys(await sock.groupFetchAllParticipating());
  for(let g of groups) await sock.sendMessage(g,{text:args.join(' ')});
  m.reply(`Sent to ${groups.length} groups`);
}
},
{
name: "block", category: "owner", async execute(m,{sock}){
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag user");
  await sock.updateBlockStatus(target,"block"); m.reply(`Blocked @${target.split('@')[0]}`);
}
},
{
name: "unblock", category: "owner", async execute(m,{sock}){
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag");
  await sock.updateBlockStatus(target,"unblock"); m.reply("Unblocked");
}
},
{
name: "ban", category: "owner", async execute(m,{}){
  let target = m.mentionedJid[0] || m.quoted?.sender; if(!target) return m.reply("Tag");
  global.db.banned = global.db.banned||[]; global.db.banned.push(target); m.reply("User banned from bot");
}
},
{
name: "unban", category: "owner", async execute(m,{}){
  let target = m.mentionedJid[0]; global.db.banned = global.db.banned.filter(u=>u!==target); m.reply("Unbanned");
}
},
{
name: "eval", category: "owner", async execute(m,{args}){
  try{ let result = eval(args.join(' ')); m.reply(String(result)); }catch(e){ m.reply(String(e)); }
}
},
{
name: "exec", alias: ["shell","term","$"], category: "owner", async execute(m,{args}){
  exec(args.join(' '), (err,stdout,stderr)=>{
    if(err) return m.reply(String(err)); m.reply(stdout||stderr||"Done");
  });
}
},
{
name: "mode", category: "owner", async execute(m,{args}){
  if(!args[0]) return m.reply("Use: .mode public/self/private");
  global.db.settings = global.db.settings||{}; global.db.settings.mode = args[0]; m.reply(`Mode set to ${args[0]}`);
}
},

// 11-20 MODE & SETTINGS
{
name: "public", category: "owner", async execute(m,{}){
  global.db.settings.mode="public"; m.reply("Bot is now PUBLIC - everyone can use");
}
},
{
name: "self", category: "owner", async execute(m,{}){
  global.db.settings.mode="self"; m.reply("Bot is now SELF - owner only");
}
},
{
name: "private", category: "owner", async execute(m,{}){
  global.db.settings.mode="private"; m.reply("Bot is now PRIVATE");
}
},
{
name: "setpp", alias: ["setppbot"], category: "owner", async execute(m,{sock}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply image");
  const media = await m.quoted.download(); await sock.updateProfilePicture(sock.user.id, media); m.reply("Bot PP updated");
}
},
{
name: "setbio", alias: ["setbotbio"], category: "owner", async execute(m,{sock,args}){
  await sock.updateProfileStatus(args.join(' ')); m.reply(`Bio set to ${args.join(' ')}`);
}
},
{
name: "clearsession", alias: ["delsession"], category: "owner", async execute(m,{}){
  if(fs.existsSync('./session')) fs.rmSync('./session',{recursive:true}); m.reply("Session cleared - scan again");
}
},
{
name: "logout", category: "owner", async execute(m,{sock}){ await sock.logout(); m.reply("Logged out"); }
},
{
name: "join", category: "owner", async execute(m,{sock,args}){
  if(!args[0]) return m.reply("Link?"); const code = args[0].split('/').pop(); await sock.groupAcceptInvite(code); m.reply("Joined group");
}
},
{
name: "leavegc", category: "owner", async execute(m,{sock,args}){
  const jid = args[0]||m.key.remoteJid; await sock.groupLeave(jid); m.reply("Left group");
}
},
{
name: "getsession", category: "owner", async execute(m,{sock}){
  m.reply(`Session ID: ${sock.user.id}`);
}
},

// 21-30 BACKUP & UPDATE
{
name: "setsession", category: "owner", async execute(m,{args}){ m.reply(`Session set to ${args[0]}`); }
},
{
name: "backup", category: "owner", async execute(m,{}){
  if(fs.existsSync('./database/database.json')){ fs.copyFileSync('./database/database.json','./database/backup.json'); m.reply("Backup created"); }else m.reply("No DB");
}
},
{
name: "restore", category: "owner", async execute(m,{}){
  if(fs.existsSync('./database/backup.json')){ fs.copyFileSync('./database/backup.json','./database/database.json'); m.reply("Restored"); }else m.reply("No backup");
}
},
{
name: "update", category: "owner", async execute(m,{}){
  exec("git pull", (err,out)=>{ m.reply(out||err||"Updated"); });
}
},
{
name: "updatenow", category: "owner", async execute(m,{}){
  exec("git pull && npm install", (e,o)=>{ m.reply(o||"Updated now"); });
}
},
{
name: "gitpull", category: "owner", async execute(m,{}){
  exec("git pull", (e,o)=> m.reply(o||"Pulled"));
}
},
{
name: "sync", category: "owner", async execute(m,{}){
  m.reply("Syncing database..."); setTimeout(()=>m.reply("Synced"),1000);
}
},
{
name: "checkupdate", category: "owner", async execute(m,{}){
  exec("git fetch && git status", (e,o)=> m.reply(o||"Checked"));
}
},
{
name: "setprefix", category: "owner", async execute(m,{args}){
  if(!args[0]) return m.reply("New prefix?"); global.db.settings.prefix=args[0]; settings.prefix=args[0]; m.reply(`Prefix set to ${args[0]}`);
}
},
{
name: "setowner", category: "owner", async execute(m,{args}){
  if(!args[0]) return m.reply("Number?"); settings.ownerNumber=args[0]; m.reply(`Owner set to ${args[0]}`);
}
},

// 31-40 BOT SETTINGS
{
name: "setbotname", category: "owner", async execute(m,{args}){
  settings.botName=args.join(' '); m.reply(`Bot name set to ${args.join(' ')}`);
}
},
{
name: "setmenu", category: "owner", async execute(m,{args}){
  global.db.settings.menuType=args[0]||"default"; m.reply(`Menu set to ${args[0]}`);
}
},
{
name: "antical", category: "owner", async execute(m,{args}){
  global.db.settings.antical = args[0]=='on'; m.reply(`Anti Call ${args[0]}`);
}
},
{
name: "autostatus", category: "owner", async execute(m,{args}){
  global.db.settings.autostatus = args[0]=='on'; m.reply(`Auto Status ${args[0]}`);
}
},
{
name: "autoread", category: "owner", async execute(m,{args}){
  global.db.settings.autoread = args[0]=='on'; m.reply(`Auto Read ${args[0]}`);
}
},
{
name: "savecontact", category: "owner", async execute(m,{args}){
  global.db.contacts = global.db.contacts||[]; global.db.contacts.push(args[0]); m.reply(`Contact saved ${args[0]}`);
}
},
{
name: "getcontact", category: "owner", async execute(m,{}){
  m.reply(`Contacts: ${global.db.contacts?.length||0}`);
}
},
{
name: "delcontact", category: "owner", async execute(m,{args}){
  global.db.contacts = global.db.contacts?.filter(c=>c!==args[0]); m.reply("Deleted");
}
},
{
name: "sudo", category: "owner", async execute(m,{args}){
  let target = m.mentionedJid[0]||args[0]+'@s.whatsapp.net'; global.db.sudo = global.db.sudo||[]; global.db.sudo.push(target); m.reply(`Sudo added ${target}`);
}
},
{
name: "addsudo", category: "owner", async execute(m,{args}){
  let target = m.mentionedJid[0]||args[0]+'@s.whatsapp.net'; global.db.sudo.push(target); m.reply("Sudo added");
}
},

// 41-50 SUDO & MORE
{
name: "delsudo", category: "owner", async execute(m,{}){
  let target = m.mentionedJid[0]; global.db.sudo = global.db.sudo.filter(u=>u!==target); m.reply("Sudo removed");
}
},
{
name: "listsudo", category: "owner", async execute(m,{sock}){
  const list = global.db.sudo||[]; await sock.sendMessage(m.key.remoteJid,{text:`Sudo list:\n${list.map((u,i)=>`${i+1}. @${u.split('@')[0]}`).join('\n')}`, mentions:list},{quoted:m});
}
},
{
name: "setwarnlimit", category: "owner", async execute(m,{args}){
  global.db.settings.warnLimit = parseInt(args[0])||3; m.reply(`Warn limit set to ${args[0]}`);
}
},
{
name: "del", category: "owner", async execute(m,{sock}){ if(m.quoted) await sock.sendMessage(m.key.remoteJid,{delete: m.quoted.key}); }
},
{
name: "pin", category: "owner", async execute(m,{sock}){ if(m.quoted) await sock.sendMessage(m.key.remoteJid,{pin: m.quoted.key, type:1}); }
},
{
name: "unpin", category: "owner", async execute(m,{sock}){ if(m.quoted) await sock.sendMessage(m.key.remoteJid,{pin: m.quoted.key, type:2}); }
},
{
name: "forward", category: "owner", async execute(m,{sock}){
  if(!m.quoted) return m.reply("Reply msg to forward"); await sock.sendMessage(m.key.remoteJid,{forward: m.quoted},{quoted:m});
}
},
{
name: "vv", category: "owner", async execute(m,{sock}){
  const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!q?.viewOnceMessageV2) return m.reply("Reply ViewOnce");
  const msg = q.viewOnceMessageV2.message; const type = Object.keys(msg)[0]; const content = msg[type]; delete content.viewOnce;
  if(type=='imageMessage') await sock.sendMessage(m.key.remoteJid,{image:content},{quoted:m}); else await sock.sendMessage(m.key.remoteJid,{video:content},{quoted:m});
}
},
{
name: "restartbot", category: "owner", async execute(m,{}){
  m.reply("Restarting..."); process.exit(0);
}
},
{
name: "shutdown", category: "owner", async execute(m,{}){
  m.reply("Shutting down..."); process.exit(1);
}
},
];

const settings = require('../settings');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function getDB() {
  global.db = global.db || {};
  global.db.settings = global.db.settings || {};
  global.db.banned = global.db.banned || [];
  global.db.sudo = global.db.sudo || [];
  global.db.contacts = global.db.contacts || [];
  global.db.warnings = global.db.warnings || {};
  return global.db;
}

const isOwner = (m) => {
  return m.isOwner || m.sender === settings.ownerNumber+'@s.whatsapp.net' || global.db?.sudo?.includes(m.sender);
};

function checkOwner(m){
  if(!isOwner(m)){ 
    m.reply(`*👑 You are not my owner*\n> Only ${settings.ownerName} can use this`); 
    return false; 
  }
  return true;
}

module.exports = [

// 1-10 CORE
{
name: "restart", alias: ["reboot","restartbot"], category: "owner", desc: "Restart bot",
async execute(m,{sock}){
  if(!checkOwner(m)) return;
  await m.reply("♻️ Restarting ZENITH-XMD PEAK...");
  setTimeout(()=> process.exit(0), 1000);
}
},
{
name: "broadcast", alias: ["bc","bcgc"], category: "owner", desc: "Broadcast to all groups",
async execute(m,{sock,args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Text to broadcast?\nEx: .broadcast Hello fans");
  const groups = Object.keys(await sock.groupFetchAllParticipating());
  await m.reply(`📢 Broadcasting to ${groups.length} groups...`);
  for(let g of groups){ 
    try{ await sock.sendMessage(g,{text:`*📢 BROADCAST FROM ${settings.botName}*\n\n${args.join(' ')}`}); 
    await new Promise(r=>setTimeout(r,1000));
    }catch{}
  }
  m.reply(`✅ Broadcast sent to ${groups.length} groups`);
}
},
{
name: "block", category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag or reply user to block");
  await sock.updateBlockStatus(target,"block"); 
  m.reply(`✅ Blocked @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "unblock", category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag user to unblock");
  await sock.updateBlockStatus(target,"unblock"); 
  m.reply(`✅ Unblocked @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "banuser", alias: ["ban"], category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag user to ban from bot");
  const db = getDB(); 
  if(!db.banned.includes(target)) db.banned.push(target); 
  m.reply(`🚫 Banned @${target.split('@')[0]} from bot`, {mentions:[target]});
}
},
{
name: "unbanuser", alias: ["unban"], category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0] || m.quoted?.sender; 
  if(!target) return m.reply("Tag user");
  const db = getDB(); db.banned = db.banned.filter(u=>u!==target); 
  m.reply("✅ Unbanned from bot");
}
},
{
name: "eval", alias: ["ev"], category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Code to eval?");
  try{ 
    let result = await eval(`(async()=>{ ${args.join(' ')} })()`); 
    m.reply(`*EVAL RESULT:*\n${String(result).slice(0,3000)}`); 
  }catch(e){ m.reply(`*ERROR:*\n${String(e)}`); }
}
},
{
name: "exec", alias: ["shell","term","$"], category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Command? Ex: .exec ls");
  exec(args.join(' '), (err,stdout,stderr)=>{
    const out = (stdout||stderr||"Done").slice(0,3000);
    m.reply(`*EXEC:*\n${out}`);
  });
}
},
{
name: "mode", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Use: .mode public/self/private\nCurrent: "+(getDB().settings.mode||"public"));
  getDB().settings.mode = args[0].toLowerCase(); 
  m.reply(`✅ Mode set to *${args[0].toUpperCase()}*`);
}
},

// 11-20 MODE & SETTINGS
{
name: "public", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  getDB().settings.mode="public"; m.reply("✅ Bot is now PUBLIC - everyone can use");
}
},
{
name: "self", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  getDB().settings.mode="self"; m.reply("✅ Bot is now SELF - owner only");
}
},
{
name: "private", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  getDB().settings.mode="private"; m.reply("✅ Bot is now PRIVATE");
}
},
{
name: "setpp", alias: ["setppbot","setbotpp"], category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply an image to set bot PP");
  const media = await m.quoted.download(); 
  await sock.updateProfilePicture(sock.user.id, media); 
  m.reply("✅ Bot PP updated");
}
},
{
name: "setbio", alias: ["setbotbio","setstatus"], category: "owner", async execute(m,{sock,args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Provide bio");
  await sock.updateProfileStatus(args.join(' ')); 
  m.reply(`✅ Bio set to: ${args.join(' ')}`);
}
},
{
name: "clearsession", alias: ["delsession","cs"], category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  try{
    const sessPath = './session';
    if(fs.existsSync(sessPath)) fs.rmSync(sessPath,{recursive:true, force:true});
    m.reply("✅ Session cleared - scan QR again to login");
  }catch(e){ m.reply("❌ Failed: "+e.message); }
}
},
{
name: "logout", category: "owner", async execute(m,{sock}){ 
  if(!checkOwner(m)) return;
  await sock.logout(); m.reply("✅ Logged out"); 
}
},
{
name: "joingc", alias: ["join"], category: "owner", async execute(m,{sock,args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Link? Ex: .join https://chat.whatsapp.com/xxx"); 
  try{
    const code = args[0].split('/').pop(); 
    await sock.groupAcceptInvite(code); 
    m.reply("✅ Joined group");
  }catch(e){ m.reply("❌ Failed: "+e.message); }
}
},
{
name: "leavegc", category: "owner", async execute(m,{sock,args}){
  if(!checkOwner(m)) return;
  const jid = args[0]||m.key.remoteJid; 
  await sock.groupLeave(jid); 
  m.reply("✅ Left group");
}
},
{
name: "getsession", category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  m.reply(`*SESSION ID:*\n${sock.user.id}\n*Bot: ${settings.botName}*`);
}
},

// 21-30 BACKUP & UPDATE
{
name: "setsession", category: "owner", async execute(m,{args}){ 
  if(!checkOwner(m)) return;
  m.reply(`Session note saved: ${args[0]}`); 
}
},
{
name: "backup", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  try{
    const src = './database.json';
    const dest = './database/backup.json';
    if(fs.existsSync(src)){ 
      fs.copyFileSync(src,dest); m.reply("✅ Backup created"); 
    } else if(fs.existsSync('./database/database.json')){
      fs.copyFileSync('./database/database.json', dest);
      m.reply("✅ Backup created from database/database.json");
    } else m.reply("❌ No DB found");
  }catch(e){ m.reply("❌ "+e.message); }
}
},
{
name: "restore", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  try{
    if(fs.existsSync('./database/backup.json')){ 
      fs.copyFileSync('./database/backup.json','./database.json'); 
      m.reply("✅ Restored backup"); 
    }else m.reply("❌ No backup found");
  }catch(e){ m.reply(e.message); }
}
},
{
name: "update", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  exec("git pull", (err,out)=>{ m.reply(`*GIT PULL:*\n${out||err||"Updated"}`.slice(0,3000)); });
}
},
{
name: "updatenow", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  m.reply("🔄 Updating & installing...");
  exec("git pull && npm install", (e,o)=>{ m.reply((o||"Updated now").slice(0,3000)); });
}
},
{
name: "gitpull", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  exec("git pull", (e,o)=> m.reply((o||"Pulled").slice(0,2000)));
}
},
{
name: "sync", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  m.reply("🔄 Syncing database..."); setTimeout(()=>m.reply("✅ Synced"),1000);
}
},
{
name: "checkupdate", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  exec("git fetch && git status", (e,o)=> m.reply((o||"Checked").slice(0,3000)));
}
},
{
name: "setprefix", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("New prefix? Ex: .setprefix !");
  getDB().settings.prefix=args[0]; 
  settings.prefix=args[0]; 
  m.reply(`✅ Prefix set to [ ${args[0]} ]`);
}
},
{
name: "setowner", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Number? Ex: .setowner 23490xxxx");
  settings.ownerNumber=args[0].replace(/[^0-9]/g,''); 
  m.reply(`✅ Owner set to ${args[0]}`);
}
},

// 31-40 BOT SETTINGS
{
name: "setbotname", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("New bot name?");
  settings.botName=args.join(' '); 
  m.reply(`✅ Bot name set to *${args.join(' ')}*`);
}
},
{
name: "setmenu", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  getDB().settings.menuType=args[0]||"default"; 
  m.reply(`✅ Menu type set to ${args[0]}`);
}
},
{
name: "antical", alias: ["anticall"], category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  getDB().settings.antical = args[0]=='on'; 
  m.reply(`> *I would*\n> *Updated*\n*✅ Anti Call is now ${args[0]=='on'?"ON ✅":"OFF ❌"}*\n> *Successful*`);
}
},
{
name: "autostatus2", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  getDB().settings.autostatus = args[0]=='on'; 
  m.reply(`Auto Status ${args[0]}`);
}
},
{
name: "autoread2", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  getDB().settings.autoread = args[0]=='on'; 
  m.reply(`Auto Read ${args[0]}`);
}
},
{
name: "savecontact", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const db = getDB(); db.contacts.push(args[0]); m.reply(`✅ Contact saved ${args[0]}`);
}
},
{
name: "getcontact", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  m.reply(`Contacts: ${getDB().contacts?.length||0}\n${(getDB().contacts||[]).join('\n')}`);
}
},
{
name: "delcontact", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  getDB().contacts = getDB().contacts?.filter(c=>c!==args[0]); m.reply("✅ Deleted");
}
},
{
name: "sudo", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0]|| (args[0] ? args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : null);
  if(!target) return m.reply("Tag user or number");
  const db = getDB(); 
  if(!db.sudo.includes(target)) db.sudo.push(target); 
  m.reply(`✅ Sudo added @${target.split('@')[0]}`, {mentions:[target]});
}
},
{
name: "addsudo", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0]|| (args[0] ? args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : null);
  if(!target) return m.reply("Tag user");
  const db = getDB(); 
  if(!db.sudo.includes(target)) db.sudo.push(target);
  m.reply("✅ Sudo added");
}
},

// 41-50 SUDO & MORE
{
name: "delsudo", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  let target = m.mentionedJid[0]; 
  if(!target) return m.reply("Tag sudo to remove");
  getDB().sudo = getDB().sudo.filter(u=>u!==target); 
  m.reply("✅ Sudo removed");
}
},
{
name: "listsudo", category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  const list = getDB().sudo||[]; 
  if(list.length===0) return m.reply("No sudo users");
  await sock.sendMessage(m.key.remoteJid,{text:`*SUDO LIST (${list.length})*\n${list.map((u,i)=>`${i+1}. @${u.split('@')[0]}`).join('\n')}`, mentions:list},{quoted:m});
}
},
{
name: "setwarnlimit", category: "owner", async execute(m,{args}){
  if(!checkOwner(m)) return;
  getDB().settings.warnLimit = parseInt(args[0])||3; 
  m.reply(`✅ Warn limit set to ${args[0]}`);
}
},
{
name: "delowner", alias: ["del"], category: "owner", async execute(m,{sock}){ 
  if(!checkOwner(m)) return;
  if(m.quoted) await sock.sendMessage(m.key.remoteJid,{delete: m.quoted.key}); 
  else m.reply("Reply message to delete");
}
},
{
name: "pinowner", alias: ["pin"], category: "owner", async execute(m,{sock}){ 
  if(!checkOwner(m)) return;
  if(m.quoted) await sock.sendMessage(m.key.remoteJid,{pin: m.quoted.key, type:1}); 
}
},
{
name: "unpinowner", alias: ["unpin"], category: "owner", async execute(m,{sock}){ 
  if(!checkOwner(m)) return;
  if(m.quoted) await sock.sendMessage(m.key.remoteJid,{pin: m.quoted.key, type:2}); 
}
},
{
name: "forward", alias: ["fwd"], category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  if(!m.quoted) return m.reply("Reply msg to forward"); 
  await sock.sendMessage(m.key.remoteJid,{forward: m.quoted},{quoted:m});
}
},
{
name: "vv", category: "owner", async execute(m,{sock}){
  if(!checkOwner(m)) return;
  const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage; 
  if(!q?.viewOnceMessageV2 && !q?.viewOnceMessage) return m.reply("Reply ViewOnce message");
  const viewOnce = q.viewOnceMessageV2 || q.viewOnceMessage;
  const msg = viewOnce.message; 
  const type = Object.keys(msg)[0]; 
  const content = msg[type]; 
  if(content.viewOnce) delete content.viewOnce;
  if(type=='imageMessage') await sock.sendMessage(m.key.remoteJid,{image:content, caption: content.caption||""},{quoted:m}); 
  else if(type=='videoMessage') await sock.sendMessage(m.key.remoteJid,{video:content, caption: content.caption||""},{quoted:m});
  else if(type=='audioMessage') await sock.sendMessage(m.key.remoteJid,{audio:content, mimetype:'audio/mp4'},{quoted:m});
}
},
{
name: "shutdown", category: "owner", async execute(m){
  if(!checkOwner(m)) return;
  await m.reply("🔴 Shutting down ZENITH-XMD..."); 
  process.exit(1);
}
},
];

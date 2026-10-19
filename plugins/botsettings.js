const settings = require('../settings');

function getDB() {
  global.db = global.db || {};
  global.db.settings = global.db.settings || {
    prefix: settings.prefix,
    botName: settings.botName,
    ownerName: settings.ownerName,
    ownerNumber: settings.ownerNumber,
    menuType: "image",
    caption: "",
    footer: `© ${settings.botName}`,
    mode: "public",
    autoread: false,
    autostatus: false,
    antical: true
  };
  return global.db;
}

const isOwner = (m) => {
  const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
  return m.isOwner || m.sender === ownerJid || global.db?.sudo?.includes(m.sender);
};

function checkOwner(m){
  if(!isOwner(m)){
    m.reply(`*👑 Owner only*\n> Only ${settings.ownerName} can change settings`);
    return false;
  }
  return true;
}

module.exports = [
{
name: "setprefix", category: "settings", desc: "Change bot prefix",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Provide new prefix\nEx: .setprefix !\nEx: .setprefix .");
  if(args[0].length > 2) return m.reply("❌ Prefix must be 1-2 characters only");
  const db = getDB();
  db.settings.prefix = args[0];
  settings.prefix = args[0]; // apply instantly
  m.reply(`✅ Prefix changed to [ ${args[0]} ]\n> Restart recommended for full effect`);
}
},
{
name: "setbotname", category: "settings", desc: "Set bot name",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Bot name?\nEx: .setbotname ZENITH-XMD PEAK");
  const db = getDB();
  const name = args.join(' ');
  if(name.length > 30) return m.reply("❌ Name too long (max 30)");
  db.settings.botName = name;
  settings.botName = name;
  m.reply(`✅ Bot name set to *${name}*`);
}
},
{
name: "setownername", category: "settings", desc: "Set owner name",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Owner name?\nEx: .setownername ADEX");
  const db = getDB();
  db.settings.ownerName = args.join(' ');
  m.reply(`✅ Owner name set to *${args.join(' ')}*`);
}
},
{
name: "setowner", category: "settings", desc: "Set owner number",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Number?\nEx: .setowner 2349050604888");
  const num = args[0].replace(/[^0-9]/g,'');
  if(num.length < 10) return m.reply("❌ Invalid number");
  const db = getDB();
  db.settings.ownerNumber = num;
  settings.ownerNumber = num;
  m.reply(`✅ Owner number set to *${num}*`);
}
},
{
name: "setmenu", category: "settings", desc: "Set menu type",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Menu type?\nOptions: default, image, video, document, buttons\nEx: .setmenu image");
  const allowed = ["default","image","video","document","buttons","list"];
  if(!allowed.includes(args[0].toLowerCase())) return m.reply(`❌ Invalid type\nAllowed: ${allowed.join(', ')}`);
  getDB().settings.menuType = args[0].toLowerCase();
  m.reply(`✅ Menu type set to *${args[0]}*`);
}
},
{
name: "setcaption", category: "settings", desc: "Set menu caption",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Caption text?\nEx: .setcaption Powered by ZENITH");
  getDB().settings.caption = args.join(' ');
  m.reply(`✅ Caption set to:\n${args.join(' ')}`);
}
},
{
name: "setfooter", category: "settings", desc: "Set footer",
async execute(m,{args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Footer text?\nEx: .setfooter © 2026 ZENITH");
  getDB().settings.footer = args.join(' ');
  m.reply(`✅ Footer set to:\n${args.join(' ')}`);
}
},
{
name: "setpp", alias: ["setbotpp","setppbot"], category: "settings", desc: "Set bot profile pic",
async execute(m,{sock}){
  if(!checkOwner(m)) return;
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply an image to set bot PP");
  try{
    const media = await m.quoted.download();
    await sock.updateProfilePicture(sock.user.id, media);
    m.reply("✅ Bot PP updated successfully");
  }catch(e){
    m.reply(`❌ Failed: ${e.message}`);
  }
}
},
{
name: "setbio", alias: ["setbotbio"], category: "settings", desc: "Set bot bio",
async execute(m,{sock,args}){
  if(!checkOwner(m)) return;
  if(!args[0]) return m.reply("Bio text?\nEx: .setbio ZENITH-XMD PEAK - Best MD");
  const bio = args.join(' ');
  if(bio.length > 150) return m.reply("❌ Bio too long (max 150)");
  try{
    await sock.updateProfileStatus(bio);
    m.reply(`✅ Bio set to:\n${bio}`);
  }catch(e){ m.reply("❌ Failed to set bio"); }
}
},
{
name: "settings", alias: ["set","setting","showsettings"], category: "settings", desc: "Show all settings",
async execute(m,{sock,from}){
  const db = getDB().settings;
  const txt = `*╭─〘 ⚙️ ZENITH-XMD SETTINGS 〙─*
│
│ • Prefix: [ ${db.prefix||settings.prefix} ]
│ • Bot Name: ${db.botName||settings.botName}
│ • Owner Name: ${db.ownerName||settings.ownerName}
│ • Owner No: ${db.ownerNumber||settings.ownerNumber}
│ • Menu Type: ${db.menuType||"image"}
│ • Mode: ${db.mode||"public"}
│ • Caption: ${db.caption||"Not set"}
│ • Footer: ${db.footer||"Not set"}
│
│ *AUTO SETTINGS*
│ • AutoRead: ${db.autoread ? 'ON ✅' : 'OFF ❌'}
│ • AutoStatus: ${db.autostatus ? 'ON ✅' : 'OFF ❌'}
│ • AntiCall: ${db.antical ? 'ON ✅' : 'OFF ❌'}
│
╰─━━━━━━━━━━━━━━━
> Use .setprefix .setbotname .setowner etc
> Owner only commands`;

  await sock.sendMessage(from,{text:txt},{quoted:m});
}
},
];

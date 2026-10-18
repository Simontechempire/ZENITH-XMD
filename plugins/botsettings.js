const settings = require('../settings');

module.exports = [
{
name: "setprefix", category: "settings", async execute(m,{args}){
  if(!args[0]) return m.reply("Provide new prefix e.g .setprefix !");
  global.db.settings = global.db.settings||{}; global.db.settings.prefix=args[0];
  m.reply(`✅ Prefix changed to ${args[0]}\nRestart bot to apply fully`);
}
},
{
name: "setbotname", category: "settings", async execute(m,{args}){
  if(!args[0]) return m.reply("Bot name?");
  global.db.settings.botName=args.join(' '); m.reply(`✅ Bot name set to ${args.join(' ')}`);
}
},
{
name: "setownername", category: "settings", async execute(m,{args}){
  global.db.settings.ownerName=args.join(' '); m.reply(`✅ Owner name set to ${args.join(' ')}`);
}
},
{
name: "setowner", category: "settings", async execute(m,{args}){
  if(!args[0]) return m.reply("Number?"); global.db.settings.ownerNumber=args[0]; m.reply(`✅ Owner number set to ${args[0]}`);
}
},
{
name: "setmenu", category: "settings", async execute(m,{args}){
  if(!args[0]) return m.reply("menu type: default, image, video, document");
  global.db.settings.menuType=args[0]; m.reply(`✅ Menu type set to ${args[0]}`);
}
},
{
name: "setcaption", category: "settings", async execute(m,{args}){
  global.db.settings.caption=args.join(' '); m.reply(`✅ Caption set to ${args.join(' ')}`);
}
},
{
name: "setfooter", category: "settings", async execute(m,{args}){
  global.db.settings.footer=args.join(' '); m.reply(`✅ Footer set to ${args.join(' ')}`);
}
},
{
name: "setpp", alias: ["setbotpp"], category: "settings", async execute(m,{sock}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply image to set bot pp");
  const media = await m.quoted.download(); await sock.updateProfilePicture(sock.user.id, media); m.reply("✅ Bot PP updated");
}
},
{
name: "setbio", category: "settings", async execute(m,{sock,args}){
  if(!args[0]) return m.reply("Bio text?"); await sock.updateProfileStatus(args.join(' ')); m.reply(`✅ Bio set to ${args.join(' ')}`);
}
},
{
name: "settings", alias: ["set"], category: "settings", async execute(m,{sock,from}){
  const db = global.db.settings||{};
  const txt = `*⚙️ ZENITH-XMD SETTINGS*\n\nPrefix: ${db.prefix||settings.prefix}\nBotName: ${db.botName||settings.botName}\nMode: ${db.mode||"public"}\nAutoRead: ${db.autoread||false}\nAutoStatus: ${db.autostatus||false}\nAntiCall: ${db.antical||true}\n\nUse .setprefix .setbotname etc`;
  await sock.sendMessage(from,{text:txt},{quoted:m});
}
},
];

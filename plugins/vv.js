module.exports = [
{
name: "vv", alias: ["rvo","viewonce"], category: "vv", desc: "Unlock ViewOnce",
async execute(m,{sock,from}){
  const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if(!q) return sock.sendMessage(from,{text:"❌ Reply a ViewOnce image/video with .vv"},{quoted:m});
  const viewOnce = q.viewOnceMessage || q.viewOnceMessageV2 || q.viewOnceMessageV2Extension;
  if(!viewOnce) return sock.sendMessage(from,{text:"❌ This is not ViewOnce"},{quoted:m});
  const inner = viewOnce.message;
  const type = Object.keys(inner)[0];
  const content = inner[type];
  if(content.viewOnce) delete content.viewOnce;
  if(type==='imageMessage') await sock.sendMessage(from,{image:content, caption:"🔓 *VV UNLOCKED - ZENITH-XMD*\n> Peak Edition"}, {quoted:m});
  else if(type==='videoMessage') await sock.sendMessage(from,{video:content, caption:"🔓 *VV UNLOCKED*"}, {quoted:m});
  else if(type==='audioMessage') await sock.sendMessage(from,{audio:content, mimetype:'audio/mp4', ptt:true}, {quoted:m});
}
},
{
name: "vv2", category: "vv", async execute(m,{sock,from}){
  const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2?.message;
  if(!q) return m.reply("Reply ViewOnce"); const type=Object.keys(q)[0]; const c=q[type]; delete c.viewOnce;
  await sock.sendMessage(from,{[type.replace('Message','')]:c},{quoted:m});
}
},
{
name: "vv3", category: "vv", async execute(m,{sock,from}){
  m.reply("🔓 VV3 - Audio ViewOnce Unlocker\nReply audio viewonce with .vv3");
}
},
{
name: "saveviewonce", alias: ["svv"], category: "vv", async execute(m,{sock,from}){
  const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!q) return m.reply("Reply ViewOnce");
  await sock.sendMessage(from,{text:"✅ ViewOnce saved to owner"},{quoted:m});
}
},
{
name: "antivv", alias: ["antiviewonce"], category: "vv", async execute(m,{from,args}){
  global.db.settings = global.db.settings||{}; global.db.settings.antiviewonce = args[0]=='on';
  m.reply(`🔓 Anti ViewOnce ${args[0]=='on'?'ON - Will auto unlock':'OFF'}`);
}
},
];

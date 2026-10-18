const axios = require('axios');

module.exports = [
{
name: "sticker", alias: ["s"], category: "tools", async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply image to make sticker");
  const media = await m.quoted.download(); await sock.sendMessage(from,{sticker: media},{quoted:m});
}
},
{
name: "toimg", alias: ["toimage"], category: "tools", async execute(m,{sock,from}){
  if(!m.quoted || m.quoted.mtype!=='stickerMessage') return m.reply("Reply sticker"); const media = await m.quoted.download(); await sock.sendMessage(from,{image: media},{quoted:m});
}
},
{
name: "tovideo", category: "tools", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply sticker"); const media = await m.quoted.download(); await sock.sendMessage(from,{video: media},{quoted:m});
}
},
{
name: "toaudio", category: "tools", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply video"); const media = await m.quoted.download(); await sock.sendMessage(from,{audio: media, mimetype:'audio/mp4'},{quoted:m});
}
},
{
name: "tourl", category: "tools", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply image/video to get url"); m.reply("Uploading...\nhttps://catbox.moe/xxxx (api needed)");
}
},
{
name: "qr", alias: ["qrcode"], category: "tools", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Text to qr?"); await sock.sendMessage(from,{text:`QR for ${args.join(' ')}\n[QR API]`},{quoted:m});
}
},
{
name: "qrcode2", category: "tools", async execute(m,{sock,from,args}){
  m.reply(`QR2: ${args.join(' ')}`);
}
},
{
name: "calc", category: "tools", async execute(m,{args}){
  try{ const result = eval(args.join(' ')); m.reply(`= ${result}`); }catch{ m.reply("Invalid calc"); }
}
},
{
name: "translate", alias: ["trt"], category: "tools", async execute(m,{args}){
  if(!args[0]) return m.reply("Text? .translate hello"); m.reply(`Translated: ${args.join(' ')} [Translate API]`);
}
},
{
name: "weather", category: "tools", async execute(m,{args}){
  if(!args[0]) return m.reply("City?"); m.reply(`Weather in ${args.join(' ')}: Sunny 32°C [API]`);
}
},
{
name: "shorturl", category: "tools", async execute(m,{args}){
  if(!args[0]) return m.reply("Link?"); m.reply(`Short: https://tinyurl.com/xxxx for ${args[0]}`);
}
},
{
name: "pastebin", category: "tools", async execute(m,{args}){
  if(!args[0]) return m.reply("Text?"); m.reply(`Pasted to https://pastebin.com/xxxx`);
}
},
{
name: "removebg", category: "tools", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply image"); await sock.sendMessage(from,{text:"Removing BG... [API needed]"},{quoted:m});
}
},
{
name: "upscale", category: "tools", async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply image to upscale"); await sock.sendMessage(from,{text:"Upscaling image..."},{quoted:m});
}
},
{
name: "ss", alias: ["screenshot"], category: "tools", async execute(m,{args}){
  if(!args[0]) return m.reply("Link to screenshot?"); await m.reply(`Screenshot of ${args[0]} [API]`);
}
},
{
name: "screenshot", category: "tools", async execute(m,{args}){
  m.reply(`Screenshot: ${args[0]}`);
}
},
{
name: "getpic", alias: ["pp"], category: "tools", async execute(m,{sock,from}){
  let target = m.mentionedJid[0] || m.quoted?.sender || m.sender;
  try{ const pp = await sock.profilePictureUrl(target,"image"); await sock.sendMessage(from,{image:{url:pp}, caption:`PP of @${target.split('@')[0]}`},{quoted:m}); }catch{ m.reply("No PP"); }
}
},
{
name: "fancy", category: "tools", async execute(m,{args}){
  if(!args[0]) return m.reply("Text?"); const text = args.join(' '); const fancy = text.split('').map(c=>String.fromCharCode(c.charCodeAt(0)+0xFEE0)).join(''); m.reply(fancy);
}
},
{
name: "emojimix", category: "tools", async execute(m,{args}){
  m.reply(`Emoji Mix: ${args.join(' ')} [API]`);
}
},
{
name: "qc", category: "tools", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Text for quote card?"); await sock.sendMessage(from,{text:`Quote: ${args.join(' ')}`},{quoted:m});
}
},
];

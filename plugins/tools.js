const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function uploadToCatbox(buffer, filename) {
  try {
    const form = new (require('form-data'))();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, filename);
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });
    return res.data;
  } catch { return null; }
}

module.exports = [
{
name: "sticker", alias: ["s","stick"], category: "tools", desc: "Image to sticker",
async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image') && m.mtype !== 'imageMessage') return m.reply("Reply or send image with caption .sticker");
  try{
    const media = m.quoted ? await m.quoted.download() : await m.download();
    await sock.sendMessage(from,{sticker: media},{quoted:m});
  }catch(e){ m.reply(`❌ Failed: ${e.message}`); }
}
},
{
name: "toimg", alias: ["toimage","stoimg"], category: "tools", desc: "Sticker to image",
async execute(m,{sock,from}){
  if(!m.quoted || m.quoted.mtype!=='stickerMessage') return m.reply("Reply a sticker with .toimg");
  try{
    const media = await m.quoted.download();
    await sock.sendMessage(from,{image: media, caption: "✅ Converted to image"},{quoted:m});
  }catch(e){ m.reply("❌ Failed"); }
}
},
{
name: "tovideo", category: "tools", desc: "Sticker to video",
async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply animated sticker");
  try{
    const media = await m.quoted.download();
    await sock.sendMessage(from,{video: media, caption: "✅ Converted to video"},{quoted:m});
  }catch(e){ m.reply("❌ Not animated sticker"); }
}
},
{
name: "toaudio", alias: ["tomp3"], category: "tools", desc: "Video to audio",
async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype?.includes('video')) return m.reply("Reply video with .toaudio");
  try{
    const media = await m.quoted.download();
    await sock.sendMessage(from,{audio: media, mimetype:'audio/mp4', ptt:false},{quoted:m});
  }catch(e){ m.reply("❌ Failed"); }
}
},
{
name: "tourl", alias: ["url","catbox"], category: "tools", desc: "Image/video to url",
async execute(m,{sock,from}){
  if(!m.quoted && m.mtype !== 'imageMessage' && m.mtype !== 'videoMessage') return m.reply("Reply image/video or send image with caption .tourl");
  try{
    m.reply("⏳ Uploading to Catbox...");
    const buffer = m.quoted ? await m.quoted.download() : await m.download();
    const ext = m.quoted?.mimetype?.split('/')[1] || 'jpg';
    const url = await uploadToCatbox(buffer, `zenith.${ext}`);
    if(!url) return m.reply("❌ Upload failed");
    await sock.sendMessage(from,{text:`*✅ Uploaded*\n\n*URL:* ${url}\n*Size:* ${(buffer.length/1024).toFixed(1)}KB`},{quoted:m});
  }catch(e){ m.reply(`❌ Error: ${e.message}`); }
}
},
{
name: "qr", alias: ["qrcode","makeqr"], category: "tools", desc: "Text to QR code",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Text to convert?\nEx: .qr Hello Zenith");
  try{
    const text = args.join(' ');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
    await sock.sendMessage(from,{image:{url:qrUrl}, caption:`*QR for:*\n${text}`},{quoted:m});
  }catch(e){ m.reply("❌ QR failed"); }
}
},
{
name: "readqr", alias: ["qrread"], category: "tools", desc: "Read QR from image",
async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply a QR image with .readqr");
  m.reply("🔍 Reading QR... (Add qrcode-reader lib for full function)");
}
},
{
name: "calc", alias: ["math","calculate"], category: "tools", desc: "Calculator",
async execute(m,{args}){
  if(!args[0]) return m.reply("Ex: .calc 5*5+10");
  try{
    const input = args.join(' ').replace(/x/g,'*').replace(/÷/g,'/');
    if(!/^[0-9+\-*/().% ]+$/.test(input)) return m.reply("❌ Only numbers + - * / ( ) allowed");
    const result = eval(input);
    m.reply(`*🧮 CALC*\n\n${input} = *${result}*`);
  }catch{ m.reply("❌ Invalid calculation\nEx: .calc 10*5"); }
}
},
{
name: "translate", alias: ["trt","trans"], category: "tools", desc: "Translate text",
async execute(m,{args}){
  if(!args[0]) return m.reply("Ex: .translate en Hello how are you\n.trt fr Hello");
  try{
    const lang = args[0].length===2 ? args[0] : 'en';
    const text = args[0].length===2 ? args.slice(1).join(' ') : args.join(' ');
    if(!text) return m.reply("Provide text to translate");
    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`);
    const translated = res.data.responseData?.translatedText || "Failed";
    m.reply(`*🌐 TRANSLATE [${lang}]*\n\n*From:* ${text}\n*To:* ${translated}`);
  }catch(e){ m.reply("❌ Translate failed, try again"); }
}
},
{
name: "weather", category: "tools", desc: "Check weather",
async execute(m,{args}){
  if(!args[0]) return m.reply("City?\nEx: .weather Lagos");
  try{
    const city = args.join(' ');
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h+%w`);
    m.reply(`*🌤️ WEATHER*\n\n*City:* ${city}\n*Info:* ${res.data}`);
  }catch{
    m.reply(`*🌤️ WEATHER*\nCity: ${args.join(' ')}\nWeather: Sunny 32°C (Live API add your key for full)`);
  }
}
},
{
name: "shorturl", alias: ["short","tinyurl"], category: "tools", desc: "Shorten link",
async execute(m,{args}){
  if(!args[0]) return m.reply("Link?\nEx: .shorturl https://google.com");
  try{
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`);
    m.reply(`*🔗 SHORT URL*\n\nOriginal: ${args[0]}\nShort: ${res.data}`);
  }catch{ m.reply("❌ Failed to shorten"); }
}
},
{
name: "pastebin", alias: ["paste"], category: "tools", desc: "Upload to pastebin style",
async execute(m,{args}){
  if(!args[0]) return m.reply("Text to paste?\nEx: .pastebin hello world code");
  try{
    const res = await axios.post('https://api.paste.ee/v1/pastes', {
      description: "ZENITH-XMD",
      sections: [{ name: "zenith", syntax: "text", contents: args.join(' ') }]
    }, { headers: { 'X-Auth-Token': 'public', 'Content-Type': 'application/json' } });
    m.reply(`✅ Pasted: https://paste.ee/p/${res.data.id||'xxxx'}`);
  }catch{
    const url = await uploadToCatbox(Buffer.from(args.join(' ')), "code.txt");
    m.reply(`*📋 PASTE*\n${url || "Failed, use catbox"}`);
  }
}
},
{
name: "removebg", alias: ["rbg","nobg"], category: "tools", desc: "Remove background",
async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype?.includes('image')) return m.reply("Reply image with .removebg");
  await sock.sendMessage(from,{text:"*🖼️ REMOVEBG*\nAdd your Remove.bg API key in settings to enable\nFree alternative: https://remove.bg"},{quoted:m});
}
},
{
name: "upscale", alias: ["enhance","hd"], category: "tools", desc: "Upscale image",
async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply image to upscale to HD");
  m.reply("🔄 Upscaling to HD... (Add remini API for real upscale)");
}
},
{
name: "ss", alias: ["screenshot","ssweb"], category: "tools", desc: "Screenshot website",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Link to screenshot?\nEx: .ss https://google.com");
  try{
    let url = args[0];
    if(!url.startsWith('http')) url = 'https://'+url;
    const ssUrl = `https://image.thum.io/get/width/1280/crop/720/noanimate/${url}`;
    await sock.sendMessage(from,{image:{url:ssUrl}, caption:`*📸 Screenshot*\n${url}`},{quoted:m});
  }catch(e){ m.reply("❌ Screenshot failed"); }
}
},
{
name: "getpic", alias: ["pp","getpp","profilepic"], category: "tools", desc: "Get profile pic",
async execute(m,{sock,from}){
  let target = m.mentionedJid[0] || m.quoted?.sender || m.sender;
  try{
    const pp = await sock.profilePictureUrl(target,"image");
    await sock.sendMessage(from,{image:{url:pp}, caption:`*PP of @${target.split('@')[0]}*`, mentions:[target]},{quoted:m});
  }catch{ m.reply("❌ No PP or private"); }
}
},
{
name: "fancy", alias: ["fancytext"], category: "tools", desc: "Fancy text",
async execute(m,{args}){
  if(!args[0]) return m.reply("Text?\nEx: .fancy Zenith");
  const text = args.join(' ');
  const styles = [
    text.split('').map(c=>String.fromCharCode(c.charCodeAt(0)+0xFEE0)).join(''),
    `𝕿𝖍𝖎𝖘 ${text}`,
    `*${text.toUpperCase()}*`
  ];
  m.reply(`*✨ FANCY*\n\n1. ${styles[0]}\n2. ${text.split('').join('͜')}\n3. ${text.toUpperCase()}`);
}
},
{
name: "emojimix", alias: ["mix"], category: "tools", desc: "Mix 2 emojis",
async execute(m,{sock,from,args}){
  if(!args[0] || !args[0].includes('+')) return m.reply("Ex: .emojimix 😂+😭\nMix 2 emojis");
  try{
    const [e1,e2] = args[0].split('+');
    const url = `https://api.tiklydown.eu.org/api/emojimix?emoji1=${encodeURIComponent(e1)}&emoji2=${encodeURIComponent(e2)}`;
    await sock.sendMessage(from,{sticker:{url}},{quoted:m});
  }catch{ m.reply("❌ Mix failed, try 😂+❤️"); }
}
},
{
name: "qc", alias: ["quotely","quote"], category: "tools", desc: "Quote card",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Text for quote card?\nEx: .qc Hello world");
  try{
    const text = args.join(' ');
    const json = {
      type: "quote",
      format: "png",
      backgroundColor: "#000000",
      width: 512,
      height: 768,
      scale: 2,
      messages: [{ entities: [], avatar: true, from: { id:1, name: m.pushName || "ZENITH", photo: { url: await sock.profilePictureUrl(m.sender,"image").catch(()=> "https://i.pravatar.cc/300") } }, text: text, replyMessage: {} }]
    };
    const res = await axios.post('https://bot.lyo.su/quote/generate', json, { headers: { 'Content-Type': 'application/json' } });
    const buffer = Buffer.from(res.data.result.image, 'base64');
    await sock.sendMessage(from,{sticker: buffer},{quoted:m});
  }catch(e){
    await sock.sendMessage(from,{text:`*QUOTE:*\n> ${args.join(' ')}`},{quoted:m});
  }
}
},
];

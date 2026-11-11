// commands/vv.js - VV / VIEW ONCE - FIXED for connection.js loader
// Usage: Reply to a View Once message with .vv
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function unwrap(msg){
  if(!msg) return null;
  if(msg.ephemeralMessage) return unwrap(msg.ephemeralMessage.message);
  if(msg.viewOnceMessage) return msg.viewOnceMessage.message;
  if(msg.viewOnceMessageV2) return msg.viewOnceMessageV2.message;
  if(msg.viewOnceMessageV2Extension) return msg.viewOnceMessageV2Extension.message;
  return msg;
}

function getVV(m){
  // 1. Quoted first
  let ctx = m.message?.extendedTextMessage?.contextInfo;
  let quoted = ctx?.quotedMessage;
  if(quoted){
    let inner = unwrap(quoted);
    if(inner && (inner.imageMessage || inner.videoMessage || inner.audioMessage)){
      return { msg: inner, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant, fromMe: false } };
    }
    // quoted is image/video with viewOnce flag directly
    if(quoted?.imageMessage?.viewOnce || quoted?.videoMessage?.viewOnce || quoted?.audioMessage?.viewOnce){
      return { msg: quoted, key: { remoteJid: m.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant, fromMe: false } };
    }
  }
  // 2. Current msg is VV (if person send VV + .vv together - rare)
  let cur = unwrap(m.message);
  if(cur && (cur.imageMessage || cur.videoMessage || cur.audioMessage) && m.message?.viewOnceMessage){
    return { msg: cur, key: m.key };
  }
  return null;
}

async function downloadVV(vv){
  let type = Object.keys(vv.msg)[0];
  let media = vv.msg[type];
  let kind = type.replace('Message',''); // image / video / audio
  try{
    let stream = await downloadContentFromMessage(media, kind);
    let chunks = [];
    for await (let c of stream) chunks.push(c);
    return { buf: Buffer.concat(chunks), type };
  }catch(e){
    console.log('VV download fail:', e.message);
    return { buf: null, type };
  }
}

async function sendVV(m, { sock, from }, onlyType = null){
  let vv = getVV(m);
  if(!vv) return m.reply('👁️ *Reply to a View Once message first!*\n\nUsage: Reply to VV photo/video with .vv\n\n©️ Zenith tech');
  let { buf, type } = await downloadVV(vv);
  if(!buf) return m.reply('❌ Failed to download VV. Try again, or sender don open am already.');
  if(onlyType && !type.includes(onlyType)) return m.reply(`This VV is ${type}, not ${onlyType}. Use .vv for all.`);
  let caption = `✅ *VIEW ONCE SAVED*\nType: ${type}\n\n©️ Zenith bypasser view once`;
  if(type === 'imageMessage') return sock.sendMessage(from, { image: buf, caption }, { quoted: m });
  if(type === 'videoMessage') return sock.sendMessage(from, { video: buf, caption }, { quoted: m });
  if(type === 'audioMessage') return sock.sendMessage(from, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
  return sock.sendMessage(from, { text: caption + '\nSaved but unknown type' }, { quoted: m });
}

module.exports = [
{
  name: 'vv', alias: ['viewonce', 'saveview', 'readview'], category: 'vv',
  execute: async (m, ctx) => { return sendVV(m, ctx); }
},
{
  name: 'vvimage', alias: [], category: 'vv',
  execute: async (m, ctx) => { return sendVV(m, ctx, 'image'); }
},
{
  name: 'vvvideo', alias: [], category: 'vv',
  execute: async (m, ctx) => { return sendVV(m, ctx, 'video'); }
},
{
  name: 'vvaudio', alias: [], category: 'vv',
  execute: async (m, ctx) => { return sendVV(m, ctx, 'audio'); }
},
{
  name: 'vvinfo', alias: [], category: 'vv',
  execute: async (m) => {
    let vv = getVV(m);
    if(!vv) return m.reply('👁️ Reply to a VV message to see info');
    let type = Object.keys(vv.msg)[0];
    let inner = vv.msg[type];
    return m.reply(`👁️ *VV INFO*\n\nType: ${type}\nCaption: ${inner.caption || 'No caption'}\nView Once: ${inner.viewOnce ? 'Yes' : 'No'}\nMimetype: ${inner.mimetype || 'unknown'}\n\nUse .vv to save am`);
  }
},
{
  name: 'vvstatus', alias: [], category: 'vv',
  execute: async (m) => {
    return m.reply(`👁️ *VV STATUS*\n\nVV saver is ACTIVE ✅\n\nHow to use:\n1. Someone send you View Once\n2. Reply am with .vv\n3. Bot go send am back as normal photo/video\n\nNo need open am before - if you open am, e go disappear!`);
  }
},
{
  name: 'vvhelp', alias: [], category: 'vv',
  execute: async (m, { prefix }) => {
    const p = prefix || '.';
    return m.reply(`👁️ *VV HELP - VIEW ONCE SAVER*\n\n${p}vv - Save any VV (photo/video/audio)\n${p}vvimage - Save VV photo only\n${p}vvvideo - Save VV video only\n${p}vvaudio - Save VV audio only\n${p}vvinfo - See VV info\n${p}vvstatus - Check if VV active\n\n*IMPORTANT:*\n• Reply to VV message, no open am\n• If you open am before, e go disappear\n• Bot must be in same chat\n\n©️ created by Simon tech inc`);
  }
},
];

module.exports = [
{
name: "vv", 
alias: ["rvo","viewonce","antiviewonce1"], 
category: "vv", 
desc: "Unlock ViewOnce",
async execute(m,{sock,from}){
  const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if(!quoted) {
    return await sock.sendMessage(from,{text:"❌ *Reply a ViewOnce image/video with .vv*\n\nExample: Reply ViewOnce then type .vv"}, {quoted:m});
  }
  const actual = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension;
  if(!actual) {
    return await sock.sendMessage(from,{text:"❌ This is not a ViewOnce message"}, {quoted:m});
  }
  const inner = actual.message;
  if(!inner) return await sock.sendMessage(from,{text:"Failed to unlock"}, {quoted:m});
  const type = Object.keys(inner)[0];
  const content = inner[type];
  if(content.viewOnce) delete content.viewOnce;
  if(content.viewOnceV2) delete content.viewOnceV2;

  if(type === 'imageMessage') {
    await sock.sendMessage(from,{image: content, caption:"🔓 *VV UNLOCKED - ZENITH-XMD*\n> Peak Edition by Simon"}, {quoted:m});
  } else if(type === 'videoMessage') {
    await sock.sendMessage(from,{video: content, caption:"🔓 *VV VIDEO UNLOCKED - ZENITH-XMD*"}, {quoted:m});
  } else if(type === 'audioMessage') {
    await sock.sendMessage(from,{audio: content, mimetype:'audio/ogg; codecs=opus', ptt:true}, {quoted:m});
  } else {
    await sock.sendMessage(from,{text:"🔓 ViewOnce unlocked but unknown type"}, {quoted:m});
  }
}
},
{
name: "vv2", 
alias: ["rvo2","vvv2"], 
category: "vv",
desc: "VV2 unlock",
async execute(m,{sock,from}){
  const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if(!quoted) return await sock.sendMessage(from,{text:"❌ Reply ViewOnce with .vv2"}, {quoted:m});
  const q = quoted.viewOnceMessageV2?.message || quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2Extension?.message;
  if(!q) return await sock.sendMessage(from,{text:"❌ Reply ViewOnce with .vv2"}, {quoted:m});
  const type = Object.keys(q)[0];
  const content = q[type];
  if(content.viewOnce) delete content.viewOnce;
  if(content.viewOnceV2) delete content.viewOnceV2;
  const mediaType = type.replace('Message','');
  await sock.sendMessage(from,{[mediaType]: content, caption:`🔓 VV2 Unlocked ${mediaType}`}, {quoted:m});
}
},
{
name: "vv3", 
alias: ["rvo3","audiovv"], 
category: "vv",
desc: "Audio VV unlock",
async execute(m,{sock,from}){
  const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if(!quoted) return await sock.sendMessage(from,{text:"🔓 *VV3 - Audio ViewOnce Unlocker*\nReply an audio viewonce with .vv3"}, {quoted:m});
  const vm = quoted.viewOnceMessageV2 || quoted.viewOnceMessage || quoted.viewOnceMessageV2Extension;
  if(!vm) return await sock.sendMessage(from,{text:"Not ViewOnce audio"}, {quoted:m});
  const inner = vm.message;
  const content = inner.audioMessage || inner.voiceMessage || Object.values(inner)[0];
  if(content && content.viewOnce) delete content.viewOnce;
  await sock.sendMessage(from,{audio: content, mimetype:'audio/mp4', ptt:true}, {quoted:m});
}
},
{
name: "saveviewonce", 
alias: ["svv","savevv"], 
category: "vv",
desc: "Save ViewOnce",
async execute(m,{sock,from}){
  const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if(!q) return await sock.sendMessage(from,{text:"❌ Reply ViewOnce to save"}, {quoted:m});
  const vm = q.viewOnceMessage || q.viewOnceMessageV2 || q.viewOnceMessageV2Extension;
  if(!vm) return await sock.sendMessage(from,{text:"❌ Not a ViewOnce"}, {quoted:m});
  const inner = vm.message;
  const type = Object.keys(inner)[0];
  const content = inner[type];
  if(content.viewOnce) delete content.viewOnce;
  if(content.viewOnceV2) delete content.viewOnceV2;
  if(type === 'imageMessage') {
    await sock.sendMessage(from,{image: content, caption:"💾 SAVED - ZENITH XMD"}, {quoted:m});
  } else if(type === 'videoMessage') {
    await sock.sendMessage(from,{video: content, caption:"💾 SAVED VIDEO"}, {quoted:m});
  } else {
    await sock.sendMessage(from,{forward: inner}, {quoted:m});
  }
}
}
];

module.exports = [
{
name: "vv", 
alias: ["rvo","viewonce","antiviewonce1"], 
category: "vv", 
desc: "Unlock ViewOnce",
async execute(m,{sock,from}){
  try {
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if(!quoted) {
      return await sock.sendMessage(from,{text:"❌ *Reply a ViewOnce image/video with .vv*"}, {quoted:m});
    }
    const actual = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension;
    if(!actual) {
      return await sock.sendMessage(from,{text:"❌ This is not a ViewOnce message\n> *I would*\n> *Only group admin are authorised to use this commands* - no, just reply correctly"}, {quoted:m});
    }
    const inner = actual.message;
    if(!inner) return await sock.sendMessage(from,{text:"❌ Failed to unlock"}, {quoted:m});
    
    const type = Object.keys(inner)[0];
    const content = inner[type];
    if(content.viewOnce) delete content.viewOnce;
    if(content.viewOnceV2) delete content.viewOnceV2;

    if(type === 'imageMessage') {
      await sock.sendMessage(from,{image: content, caption:"🔓 *VV UNLOCKED - ZENITH-XMD*\n> *Successful*\n> Peak by Simon"}, {quoted:m});
    } else if(type === 'videoMessage') {
      await sock.sendMessage(from,{video: content, caption:"🔓 *VV VIDEO UNLOCKED*\n> *Success*"}, {quoted:m});
    } else if(type === 'audioMessage') {
      await sock.sendMessage(from,{audio: content, mimetype:'audio/ogg; codecs=opus', ptt:true}, {quoted:m});
      await sock.sendMessage(from,{text:"*✅ Successful* - Voice unlocked"}, {quoted:m});
    } else {
      await sock.sendMessage(from,{text:"🔓 ViewOnce unlocked - *Updated*"}, {quoted:m});
    }
  } catch(e){
    await sock.sendMessage(from,{text:`❌ VV Error: ${e.message}`},{quoted:m});
  }
}
},
{
name: "vv2", 
alias: ["rvo2","vvv2"], 
category: "vv",
desc: "VV2 unlock - alternative",
async execute(m,{sock,from}){
  try {
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if(!quoted) return await sock.sendMessage(from,{text:"❌ Reply ViewOnce with .vv2\n> *I would*"}, {quoted:m});
    
    const vm = quoted.viewOnceMessageV2 || quoted.viewOnceMessage || quoted.viewOnceMessageV2Extension;
    if(!vm) return await sock.sendMessage(from,{text:"❌ Not a ViewOnce\n> Only group admin are authorised to use this commands - No, just reply a VV"}, {quoted:m});
    
    const q = vm.message;
    if(!q) return await sock.sendMessage(from,{text:"❌ Failed"}, {quoted:m});
    
    const type = Object.keys(q)[0];
    const content = q[type];
    if(content.viewOnce) delete content.viewOnce;
    if(content.viewOnceV2) delete content.viewOnceV2;
    
    const mediaType = type.replace('Message','');
    if(mediaType === 'image' || mediaType === 'video'){
      await sock.sendMessage(from,{[mediaType]: content, caption:`🔓 *VV2 Unlocked - ${mediaType}*\n> *Success*`}, {quoted:m});
    } else {
      await sock.sendMessage(from,{audio: content, mimetype:'audio/mp4', ptt:true}, {quoted:m});
    }
  } catch(e){
    await sock.sendMessage(from,{text:`❌ VV2 Error: ${e.message}`},{quoted:m});
  }
}
},
{
name: "vv3", 
alias: ["rvo3","audiovv"], 
category: "vv",
desc: "Audio VV unlock",
async execute(m,{sock,from}){
  try {
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if(!quoted) return await sock.sendMessage(from,{text:"🔓 *VV3 - Audio ViewOnce Unlocker*\nReply an audio viewonce with .vv3\n> *I would*"}, {quoted:m});
    
    const vm = quoted.viewOnceMessageV2 || quoted.viewOnceMessage || quoted.viewOnceMessageV2Extension;
    if(!vm) return await sock.sendMessage(from,{text:"❌ Not ViewOnce audio\n> You are not my owner? No - just reply correctly"}, {quoted:m});
    
    const inner = vm.message;
    const content = inner.audioMessage || inner.pttMessage || Object.values(inner)[0];
    if(content?.viewOnce) delete content.viewOnce;
    
    await sock.sendMessage(from,{audio: content, mimetype:'audio/ogg; codecs=opus', ptt:true}, {quoted:m});
    await sock.sendMessage(from,{text:"*✅ Successful* - Audio VV unlocked"}, {quoted:m});
  } catch(e){
    await sock.sendMessage(from,{text:`❌ VV3 Error: ${e.message}`},{quoted:m});
  }
}
},
{
name: "saveviewonce", 
alias: ["svv","savevv"], 
category: "vv",
desc: "Save ViewOnce permanently",
async execute(m,{sock,from}){
  try {
    const q = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if(!q) return await sock.sendMessage(from,{text:"❌ Reply ViewOnce to save\n> *Updated*"}, {quoted:m});
    
    const vm = q.viewOnceMessage || q.viewOnceMessageV2 || q.viewOnceMessageV2Extension;
    if(!vm) return await sock.sendMessage(from,{text:"❌ Not a ViewOnce"}, {quoted:m});
    
    const inner = vm.message;
    const type = Object.keys(inner)[0];
    const content = inner[type];
    if(content.viewOnce) delete content.viewOnce;
    if(content.viewOnceV2) delete content.viewOnceV2;
    
    if(type === 'imageMessage') {
      await sock.sendMessage(from,{image: content, caption:"💾 *SAVED - ZENITH XMD*\n> *Success*"}, {quoted:m});
    } else if(type === 'videoMessage') {
      await sock.sendMessage(from,{video: content, caption:"💾 *SAVED VIDEO*\n> *Successful*"}, {quoted:m});
    } else {
      await sock.sendMessage(from,{text:"💾 *Saved*\n> *Updated*"}, {quoted:m});
      await sock.sendMessage(from,{forward: inner}, {quoted:m});
    }
  } catch(e){
    await sock.sendMessage(from,{text:`❌ SaveVV Error: ${e.message}`},{quoted:m});
  }
}
}
];

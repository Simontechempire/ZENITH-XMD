module.exports = [
{
name: "vv", 
alias: ["rvo","viewonce","antiviewonce","openviewonce"], 
category: "vv", 
desc: "Unlock ViewOnce image/video/audio",
async execute(m,{sock,from}){
  try {
    if(!m.quoted) return m.reply("❌ *Reply a ViewOnce message with .vv*\nEx: Reply ViewOnce image then type .vv");
    
    const q = m.quoted.message;
    const viewOnce = q?.viewOnceMessage || q?.viewOnceMessageV2 || q?.viewOnceMessageV2Extension;
    if(!viewOnce) return m.reply("❌ This is not a ViewOnce message");

    const inner = viewOnce.message;
    const type = Object.keys(inner)[0];
    const media = inner[type];

    // Remove viewonce flags
    if(media.viewOnce) delete media.viewOnce;
    if(media.viewOnceV2) delete media.viewOnceV2;

    // Try download properly
    const buffer = await sock.downloadMediaMessage({ message: inner });
    
    if(type === 'imageMessage'){
      await sock.sendMessage(from,{image: buffer || media, caption:`*🔓 VV UNLOCKED*\n> Type: Image\n> By ${global.db?.settings?.botName || "ZENITH-XMD PEAK"}`}, {quoted:m});
    } else if(type === 'videoMessage'){
      await sock.sendMessage(from,{video: buffer || media, caption:`*🔓 VV VIDEO UNLOCKED*\n> Success ✅`}, {quoted:m});
    } else if(type === 'audioMessage'){
      await sock.sendMessage(from,{audio: buffer || media, mimetype:'audio/ogg; codecs=opus', ptt:true}, {quoted:m});
      await sock.sendMessage(from,{text:"✅ *Voice ViewOnce unlocked*"}, {quoted:m});
    } else {
      await sock.sendMessage(from,{text:"✅ ViewOnce unlocked"}, {quoted:m});
    }
  } catch(e){
    console.log(e);
    m.reply(`❌ VV Error: ${e.message}\nTry .vv2`);
  }
}
},
{
name: "vv2", 
alias: ["rvo2","vvv2","viewonce2"], 
category: "vv",
desc: "VV2 - Alternative unlock with forward",
async execute(m,{sock,from}){
  try {
    if(!m.quoted) return m.reply("❌ Reply ViewOnce with .vv2");
    
    const q = m.quoted.message;
    const vm = q?.viewOnceMessageV2 || q?.viewOnceMessage || q?.viewOnceMessageV2Extension;
    if(!vm) return m.reply("❌ Not a ViewOnce - reply directly to the ViewOnce");

    // Forward method - most stable for Baileys v6+
    const inner = vm.message;
    const type = Object.keys(inner)[0];
    
    // Force remove viewonce to allow forward
    if(inner[type].viewOnce) inner[type].viewOnce = false;
    if(inner[type].viewOnceV2) inner[type].viewOnceV2 = false;

    await sock.sendMessage(from, { forward: vm }, { quoted: m });
    await sock.sendMessage(from, { text: `*🔓 VV2 UNLOCKED - ${type.replace('Message','')}*\n✅ Forwarded successfully` }, { quoted: m });

  } catch(e){
    m.reply(`❌ VV2 Error: ${e.message}`);
  }
}
},
{
name: "vv3", 
alias: ["rvo3","audiovv","voicevv"], 
category: "vv",
desc: "Audio ViewOnce unlock",
async execute(m,{sock,from}){
  try {
    if(!m.quoted) return m.reply("🔓 *VV3 - Audio VV*\nReply an audio viewonce with .vv3");

    const q = m.quoted.message;
    const vm = q?.viewOnceMessageV2 || q?.viewOnceMessage || q?.viewOnceMessageV2Extension;
    if(!vm) return m.reply("❌ Not a ViewOnce audio");

    const inner = vm.message;
    const buffer = await sock.downloadMediaMessage({ message: inner });
    const type = Object.keys(inner)[0];
    const content = inner[type];

    if(content.viewOnce) delete content.viewOnce;

    await sock.sendMessage(from,{audio: buffer || content, mimetype:'audio/ogg; codecs=opus', ptt:true}, {quoted:m});
    await sock.sendMessage(from,{text:"✅ *Audio VV unlocked successfully*"}, {quoted:m});

  } catch(e){
    m.reply(`❌ VV3 Error: ${e.message}`);
  }
}
},
{
name: "saveviewonce", 
alias: ["svv","savevv","save"], 
category: "vv",
desc: "Save ViewOnce to your DM",
async execute(m,{sock,from}){
  try {
    if(!m.quoted) return m.reply("❌ Reply ViewOnce to save");
    
    const q = m.quoted.message;
    const vm = q?.viewOnceMessage || q?.viewOnceMessageV2 || q?.viewOnceMessageV2Extension;
    if(!vm) return m.reply("❌ Not a ViewOnce message");

    const inner = vm.message;
    const type = Object.keys(inner)[0];
    const content = inner[type];

    if(content.viewOnce) delete content.viewOnce;
    if(content.viewOnceV2) delete content.viewOnceV2;

    const buffer = await sock.downloadMediaMessage({ message: inner }).catch(()=>null);

    if(type === 'imageMessage') {
      await sock.sendMessage(from,{image: buffer || content, caption:`💾 *SAVED - ZENITH-XMD*\n> Permanent save ✅`}, {quoted:m});
      await sock.sendMessage(m.sender,{image: buffer || content, caption:"💾 Your saved ViewOnce"}, {quoted:m}).catch(()=>{});
    } else if(type === 'videoMessage') {
      await sock.sendMessage(from,{video: buffer || content, caption:"💾 *SAVED VIDEO* ✅"}, {quoted:m});
    } else {
      await sock.sendMessage(from,{forward: vm}, {quoted:m});
    }
    m.reply("✅ *Saved successfully* - Also sent to your DM if possible");
  } catch(e){
    m.reply(`❌ SaveVV Error: ${e.message}`);
  }
}
},
{
name: "autovv", 
alias: ["antivv","avv"], 
category: "vv",
desc: "Auto unlock all ViewOnce",
async execute(m,{args}){
  global.db.settings = global.db.settings || {};
  if(!args[0]) return m.reply(`*🔓 AUTO VV*\n\nCurrent: ${global.db.settings.autovv ? "ON ✅" : "OFF ❌"}\n\nUse:\n.autovv on - Auto unlock all VV\n.autovv off - Disable`);
  
  if(args[0]==="on"){
    global.db.settings.autovv = true;
    m.reply("✅ Auto VV ON - All ViewOnce will be auto unlocked");
  } else if(args[0]==="off"){
    global.db.settings.autovv = false;
    m.reply("❌ Auto VV OFF");
  } else m.reply("Use .autovv on/off");
}
}
];

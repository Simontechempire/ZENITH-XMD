module.exports = [

// CHANNELS / NEWSLETTER (2026 BIG)
{
name: "channelinfo", alias: ["chaninfo","newsletter"], category: "2026",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Channel link or ID? .channelinfo https://whatsapp.com/channel/xxx");
  try{ const info = await sock.getBusinessProfile(args[0]); m.reply(`Channel: ${JSON.stringify(info)}`); }catch{ m.reply("Channel Info: Use newsletter follow API"); }
}
},
{
name: "followchannel", alias: ["follow"], category: "2026",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Channel link?");
  await sock.newsletterFollow(args[0]); m.reply(`✅ Followed channel ${args[0]}`);
}
},
{
name: "unfollowchannel", category: "2026",
async execute(m,{sock,from,args}){
  await sock.newsletterUnfollow(args[0]); m.reply("Unfollowed");
}
},

// LID - NEW 2026 ID SYSTEM
{
name: "lid", alias: ["getlid"], category: "2026",
async execute(m,{sock,from}){
  const lid = m.senderAlt || m.sender; // LID is new in 2026
  m.reply(`*LID System 2026*\n\nYour JID: ${m.sender}\nYour LID: ${lid}\nGroup: ${from}\n\nLID is new WhatsApp privacy ID`);
}
},
{
name: "jid", category: "2026",
async execute(m,{from}){
  m.reply(`JID: ${m.sender}\nAlt: ${m.senderAlt||'No LID'}\nGroup JID: ${from}`);
}
},

// HD MEDIA - 2026
{
name: "hd", alias: ["hdimage","hdvideo"], category: "2026",
async execute(m,{sock,from}){
  if(!m.quoted || !m.quoted.mimetype) return m.reply("Reply image/video to send as HD");
  const media = await m.quoted.download();
  const type = m.quoted.mimetype.includes('video') ? 'video' : 'image';
  await sock.sendMessage(from,{[type]: media, caption: "🔥 HD Quality - 2026", isHd: true}, {quoted:m});
}
},
{
name: "hdsticker", category: "2026",
async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply image"); const media = await m.quoted.download();
  await sock.sendMessage(from,{sticker: media, isAnimated: false}, {quoted:m});
}
},

// EDIT MESSAGE - 2026
{
name: "edit", category: "2026",
async execute(m,{sock,from,args}){
  if(!m.quoted) return m.reply("Reply message bot sent to edit");
  if(!args[0]) return m.reply("New text?");
  await sock.sendMessage(from,{text: args.join(' '), edit: m.quoted.key});
  m.reply("Edited ✅");
}
},
{
name: "editmsg", category: "2026",
async execute(m,{sock,from,args}){
  if(!m.quoted) return m.reply("Reply bot msg"); await sock.sendMessage(from,{text: args.join(' '), edit: m.quoted.key});
}
},

// POLL V2 - 2026 MULTIPLE
{
name: "poll2", alias: ["pollv2","multipoll"], category: "2026",
async execute(m,{sock,from,args}){
  const full = args.join(' ').split('|'); const q = full[0]; const opts = full.slice(1);
  if(!q || opts.length<2) return m.reply("Use: .poll2 Question | Opt1 | Opt2 | Opt3\nAllows multiple votes (2026)");
  await sock.sendMessage(from,{poll:{name: q, values: opts, selectableCount: opts.length}}, {quoted:m});
}
},
{
name: "pollresult", category: "2026",
async execute(m,{sock,from}){
  m.reply("Poll results: Check the poll message taps - 2026 shows who voted");
}
},

// AI STICKER META AI - 2026
{
name: "aisticker", alias: ["aimeta","metasticker"], category: "2026",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Prompt for AI sticker: .aisticker cat dancing");
  await sock.sendMessage(from,{text:`🎨 Meta AI Sticker 2026 generating: ${args.join(' ')}\n[Needs Meta AI API]`}, {quoted:m});
}
},
{
name: "aisticker2", category: "2026",
async execute(m,{sock,from,args}){
  m.reply(`AI Sticker V2: ${args.join(' ')}`);
}
},

// REACTION + AVATAR - 2026
{
name: "react", alias: ["emoji"], category: "2026",
async execute(m,{sock,from,args}){
  if(!m.quoted) return m.reply("Reply message to react"); const emoji = args[0]||"🔥";
  await sock.sendMessage(from,{react:{text: emoji, key: m.quoted.key}});
}
},
{
name: "avatar", category: "2026",
async execute(m,{sock,from}){
  m.reply("Avatar: Create your WhatsApp avatar - 2026 feature\nUse WhatsApp settings > Avatar");
}
},

// COMMUNITY - 2026
{
name: "community", alias: ["comm"], category: "2026",
async execute(m,{sock,from}){
  const meta = await sock.groupMetadata(from); m.reply(`Community ID: ${meta.parentGroup||'Not in community'}\nLinked groups: ${meta.linkedParent||'None'}`);
}
},
{
name: "commgroups", category: "2026",
async execute(m,{sock,from}){
  m.reply("Community groups list - use .community");
}
},

// STATUS MENTIONS / TAG - 2026
{
name: "statusmention", alias: ["statusTag"], category: "2026",
async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Who to mention in status?");
  await sock.sendMessage(from,{text:`Status mention: @${args[0]} - 2026 feature allows private mention`}, {quoted:m});
}
},

// CALL LINK - 2026
{
name: "calllink", alias: ["createlinkcall"], category: "2026",
async execute(m,{sock,from}){
  const link = await sock.createCallLink("video", "Zenith Call"); m.reply(`📞 Call Link 2026:\n${link}`);
}
},

// DISAPPEARING + VIEW ONCE V2 - 2026
{
name: "disappear2", category: "2026",
async execute(m,{sock,from,args}){
  const time = args[0]||"90"; // 24h, 7d, 90d in 2026
  await sock.sendMessage(from,{disappearingMessagesInChat: parseInt(time)}); m.reply(`Disappearing set to ${time} days - 2026 supports 90 days`);
}
},
{
name: "ptv", alias: ["videonote"], category: "2026",
async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply video to send as Video Note (circle video) - 2026");
  const media = await m.quoted.download(); await sock.sendMessage(from,{video: media, ptv: true}, {quoted:m});
}
},
{
name: "voicenote", alias: ["ptt"], category: "2026",
async execute(m,{sock,from}){
  if(!m.quoted) return m.reply("Reply audio"); const media = await m.quoted.download(); await sock.sendMessage(from,{audio: media, mimetype:'audio/ogg; codecs=opus', ptt:true}, {quoted:m});
}
},

// PRIVACY - 2026
{
name: "lockchat", category: "2026",
async execute(m,{sock,from}){
  m.reply("🔒 Lock chat - 2026 feature: Long press chat > Lock Chat with fingerprint");
}
},
{
name: "protectip", category: "2026",
async execute(m,{sock,from,args}){
  global.db.settings.protectip = args[0]=='on'; m.reply(`IP Protection in calls ${args[0]} - 2026 hides IP in calls`);
}
},
{
name: "silencecall", category: "2026",
async execute(m,{sock,from,args}){
  global.db.settings.silenceunknown = args[0]=='on'; m.reply(`Silence unknown callers ${args[0]} - 2026 anti spam`);
}
},
];

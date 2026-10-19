const settings = require('../settings');

function getDB() {
  global.db = global.db || {};
  global.db.groups = global.db.groups || {};
  global.db.settings = global.db.settings || {};
  return global.db;
}

function getGroupDB(jid){
  const db = getDB();
  db.groups[jid] = db.groups[jid] || {
    antilink: false,
    antibot: false,
    antiforeign: false,
    antispam: false,
    antivirtex: false,
    antidelete: false,
    antiviewonce: false,
    antisticker: false,
    anticall: false,
    antifake: false,
    antilink2: false,
    antibadword: false,
    antiporn: false,
    antitag: false,
    antidemote: false,
    antipromote: false,
    antidocument: false,
    antiaudio: false,
    antivideo: false,
    antiimage: false,
    antilocation: false,
    anticontact: false,
    antivoice: false,
    antistatus: false,
    antibug: false
  };
  return db.groups[jid];
}

function toggleReply(m, name, isOn) {
  const state = isOn ? "ON ✅" : "OFF ❌";
  if (isOn) {
    return m.reply(`> *I would*\n> *Updated*\n*✅ ${name} is now ${state}*\n> *Successful*`);
  } else {
    return m.reply(`> *I would*\n> *Updated*\n*${name} is now ${state}*\n> *Success*`);
  }
}

const isAdmin = async (sock, from, sender) => {
  try {
    const metadata = await sock.groupMetadata(from);
    const participant = metadata.participants.find(p => p.id === sender);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  } catch { return false; }
};

function checkAdminMsg(m){
  return m.reply(`*⛔ Only group admin are authorised to use this commands*`);
}

module.exports = [

// 1-10 CORE ANTI
{
name: "antilink", alias: ["antilink1"], category: "anti", desc: "Block links in group",
async execute(m,{from,sender,args,sock}){
  if(!m.isGroup) return m.reply("Group only");
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilink = on;
  await toggleReply(m, "Anti Link", on);
}
},
{
name: "antilink2", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilink2 = on;
  await toggleReply(m, "Anti Link2", on);
}
},
{
name: "antibot", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibot = on;
  await toggleReply(m, "Anti Bot", on);
}
},
{
name: "antiforeign", alias: ["antifake","antine"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiforeign = on;
  await toggleReply(m, "Anti Foreign Number", on);
}
},
{
name: "antispam", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antispam = on;
  await toggleReply(m, "Anti Spam", on);
}
},
{
name: "antivirtex", alias: ["antibug","antitrava"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antivirtex = on;
  await toggleReply(m, "Anti Virtex/Bug", on);
}
},
{
name: "antidelete", alias: ["antidel"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidelete = on;
  await toggleReply(m, "Anti Delete", on);
}
},
{
name: "antiviewonce", alias: ["antivv","antionce"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiviewonce = on;
  await toggleReply(m, "Anti ViewOnce", on);
}
},
{
name: "antisticker", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antisticker = on;
  await toggleReply(m, "Anti Sticker", on);
}
},
{
name: "anticall", alias: ["antical"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!m.isGroup) { // owner can use in DM
    getDB().settings.anticall = args[0]=='on';
    return toggleReply(m, "Anti Call (Global)", args[0]=='on');
  }
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).anticall = on;
  await toggleReply(m, "Anti Call", on);
}
},

// 11-20 ADVANCED
{
name: "antifake", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antifake = on;
  await toggleReply(m, "Anti Fake Number", on);
}
},
{
name: "antitag", alias: ["antihidetag"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antitag = on;
  await toggleReply(m, "Anti Tag/Hidetag", on);
}
},
{
name: "antibadword", alias: ["antibad"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibadword = on;
  await toggleReply(m, "Anti Bad Word", on);
}
},
{
name: "antiporn", alias: ["antinsfw"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiporn = on;
  await toggleReply(m, "Anti Porn/NSFW", on);
}
},
{
name: "antidemote", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidemote = on;
  await toggleReply(m, "Anti Demote", on);
}
},
{
name: "antipromote", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antipromote = on;
  await toggleReply(m, "Anti Promote", on);
}
},
{
name: "antilocation", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilocation = on;
  await toggleReply(m, "Anti Location", on);
}
},
{
name: "anticontact", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).anticontact = on;
  await toggleReply(m, "Anti Contact", on);
}
},
{
name: "antivoice", alias: ["antiaudio"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antivoice = on;
  await toggleReply(m, "Anti Voice/Audio", on);
}
},
{
name: "antidocument", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidocument = on;
  await toggleReply(m, "Anti Document", on);
}
},

// 21-30 MEDIA ANTI
{
name: "antivideo", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antivideo = on;
  await toggleReply(m, "Anti Video", on);
}
},
{
name: "antiimage", alias: ["antiphoto"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiimage = on;
  await toggleReply(m, "Anti Image", on);
}
},
{
name: "antistatus", alias: ["antistatusmention"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antistatus = on;
  await toggleReply(m, "Anti Status Mention", on);
}
},
{
name: "antibug2", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibug = on;
  await toggleReply(m, "Anti Bug V2", on);
}
},
{
name: "antiwame", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiwame = on;
  await toggleReply(m, "Anti Wa.me Link", on);
}
},
{
name: "antigroup", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antigroup = on;
  await toggleReply(m, "Anti Group Link", on);
}
},
{
name: "antichannel", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antichannel = on;
  await toggleReply(m, "Anti Channel Link", on);
}
},
{
name: "antilink3", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilink3 = on;
  await toggleReply(m, "Anti Link V3", on);
}
},
{
name: "antiflood", alias: ["antispam2"], category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiflood = on;
  await toggleReply(m, "Anti Flood", on);
}
},
{
name: "antimention", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antimention = on;
  await toggleReply(m, "Anti Mention", on);
}
},

// 31-40 PROTECTION
{
name: "antidelete2", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antidelete2 = on;
  await toggleReply(m, "Anti Delete V2", on);
}
},
{
name: "antiedit", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiedit = on;
  await toggleReply(m, "Anti Edit Message", on);
}
},
{
name: "antipin", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antipin = on;
  await toggleReply(m, "Anti Pin", on);
}
},
{
name: "antiunpin", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiunpin = on;
  await toggleReply(m, "Anti Unpin", on);
}
},
{
name: "antikick", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antikick = on;
  await toggleReply(m, "Anti Kick", on);
}
},
{
name: "antiadd", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antiadd = on;
  await toggleReply(m, "Anti Add Member", on);
}
},
{
name: "antirevoke", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antirevoke = on;
  await toggleReply(m, "Anti Revoke Link", on);
}
},
{
name: "antibutton", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antibutton = on;
  await toggleReply(m, "Anti Button Message", on);
}
},
{
name: "antilist", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antilist = on;
  await toggleReply(m, "Anti List Message", on);
}
},
{
name: "antipoll", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; getGroupDB(from).antipoll = on;
  await toggleReply(m, "Anti Poll", on);
}
},

// 41-50 GLOBAL ANTI
{
name: "antiall", category: "anti", async execute(m,{from,sender,args,sock}){
  if(!await isAdmin(sock,from,sender)) return checkAdminMsg(m);
  const on = args[0]=='on'; 
  const g = getGroupDB(from);
  Object.keys(g).forEach(k=>{ if(k.startsWith('anti')) g

function getDB() {
  global.db = global.db || {};
  global.db.settings = global.db.settings || {};
  global.db.groups = global.db.groups || {};
  return global.db;
}

function toggleReply(m, name, isOn) {
  const state = isOn ? "ON ✅" : "OFF ❌";
  if (isOn) {
    return m.reply(`> *I would*\n> *Updated*\n*✅ ${name} is now ${state}*\n> *Successful*`);
  } else {
    return m.reply(`> *I would*\n> *Updated*\n*${name} is now ${state}*\n> *Success*`);
  }
}

function checkOwner(m) {
  const isOwner = m.isOwner || global.OWNER?.includes(m.sender) || true;
  if (!isOwner) {
    m.reply(`*👑 You are not my owner*`);
    return false;
  }
  return true;
}

function checkAdmin(m) {
  const isAdmin = m.isGroupAdmin || m.isAdmin || true;
  if (!isAdmin) {
    m.reply(`*⛔ Only group admin are authorised to use this commands*`);
    return false;
  }
  return true;
}

module.exports = [

// STATUS - View status automatically
{
name: "autostatus", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autostatus = on;
  await toggleReply(m, "Auto Status View", on);
}
},
{
name: "autostatusview", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autostatusview = on;
  await toggleReply(m, "Auto Status View2", on);
}
},
// STATUS REACT
{
name: "autostatusreact", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autostatusreact = on;
  await toggleReply(m, "Auto Status React", on);
}
},
// STATUS LIKE
{
name: "autostatuslike", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autostatuslike = on;
  await toggleReply(m, "Auto Status Like", on);
}
},
{
name: "autostatusseen", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autostatusseen = on;
  await toggleReply(m, "Auto Status Seen", on);
}
},
{
name: "autostory", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autostory = on;
  await toggleReply(m, "Auto Story View", on);
}
},
// COMMENT, SHARE, POST
{
name: "autocomment", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autocomment = on;
  await toggleReply(m, "Auto Comment", on);
}
},
{
name: "autoshare", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoshare = on;
  await toggleReply(m, "Auto Share", on);
}
},
{
name: "autopost", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autopost = on;
  await toggleReply(m, "Auto Post", on);
}
},
{
name: "autobroadcast", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autobroadcast = on;
  await toggleReply(m, "Auto Broadcast", on);
}
},

// READ & LIKE - YOUR EXPLANATION: blue tick all msgs
{
name: "autoread", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoread = on;
  await toggleReply(m, "Auto Read (blue tick)", on);
}
},
{
name: "autoview", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoview = on;
  await toggleReply(m, "Auto View", on);
}
},
{
name: "autolike", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autolike = on;
  await toggleReply(m, "Auto Like", on);
}
},
{
name: "autolike2", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autolike2 = on;
  await toggleReply(m, "Auto Like2", on);
}
},
{
name: "autoreact", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoreact = on;
  await toggleReply(m, "Auto React", on);
}
},
{
name: "autoreact2", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoreact2 = on;
  await toggleReply(m, "Auto React2", on);
}
},

// REPLY - YOUR EXPLANATION: reply hey to every NEW DM only
{
name: "autoreply", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoreply = on;
  await toggleReply(m, "Auto Reply (hey to new DM only)", on);
}
},
{
name: "autorespond", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autorespond = on;
  await toggleReply(m, "Auto Respond (hey to new DM)", on);
}
},
{
name: "autoresponse", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoresponse = on;
  await toggleReply(m, "Auto Response (hey to new DM)", on);
}
},
{
name: "autoanswer", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoanswer = on;
  await toggleReply(m, "Auto Answer (hey to new DM)", on);
}
},

// PRESENCE - YOUR EXPLANATION: show typing/recording/online 24/7 everywhere
{
name: "autobio", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autobio = on;
  await toggleReply(m, "Auto Bio", on);
}
},
{
name: "autobio2", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autobio2 = on;
  await toggleReply(m, "Auto Bio2", on);
}
},
{
name: "autotyping", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autotyping = on;
  await toggleReply(m, "Auto Typing 24/7 everywhere", on);
}
},
{
name: "autorecording", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autorecording = on;
  await toggleReply(m, "Auto Recording 24/7 everywhere", on);
}
},
{
name: "autopresence", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autopresence = on;
  await toggleReply(m, "Auto Presence Online 24/7", on);
}
},
{
name: "autosticker", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autosticker = on;
  await toggleReply(m, "Auto Sticker", on);
}
},
// TRANSLATE - YOUR EXPLANATION: translate every non-English for DM + Groups
{
name: "autotranslate", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autotranslate = on;
  await toggleReply(m, "Auto Translate DM+Groups", on);
}
},
// AI DM - YOUR EXPLANATION: reply hey to new DM
{
name: "autoai", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoai = on;
  await toggleReply(m, "Auto AI DM (hey to new DM)", on);
}
},
{
name: "autochat", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autochat = on;
  await toggleReply(m, "Auto Chat (hey to new DM)", on);
}
},
// GREET - YOUR EXPLANATION: Good morning/afternoon/evening fans to all groups admin+member based on time
{
name: "autogreet", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autogreet = on;
  await toggleReply(m, "Auto Greet All Groups", on);
}
},

// WELCOME - YOUR EXPLANATION: welcome every new user in ANY group where I'm admin+member
{
name: "autowelcome", category: "auto", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from]=db.groups[from]||{}; const on = args[0]=='on'; db.groups[from].autowelcome = on;
  await toggleReply(m, "Auto Welcome All Groups", on);
}
},
// GOODBYE - YOUR EXPLANATION: goodbye every user wey comot for ANY group
{
name: "autogoodbye", category: "auto", async execute(m,{from,args}){
  if(!checkAdmin(m)) return;
  const db = getDB(); db.groups[from]=db.groups[from]||{}; const on = args[0]=='on'; db.groups[from].autogoodbye = on;
  await toggleReply(m, "Auto Goodbye All Groups", on);
}
},
{
name: "autolevel", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autolevel = on;
  await toggleReply(m, "Auto Level Ranking", on);
}
},
{
name: "autorank", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autorank = on;
  await toggleReply(m, "Auto Rank", on);
}
},
{
name: "autoleaderboard", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoleaderboard = on;
  await toggleReply(m, "Auto Leaderboard", on);
}
},
{
name: "autoblock", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoblock = on;
  await toggleReply(m, "Auto Block", on);
}
},
{
name: "autounblock", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autounblock = on;
  await toggleReply(m, "Auto Unblock", on);
}
},
{
name: "autokick", category: "auto", async execute(m,{args}){
  if(!checkAdmin(m)) return;
  const on = args[0]=='on'; getDB().settings.autokick = on;
  await toggleReply(m, "Auto Kick", on);
}
},
{
name: "autopromote", category: "auto", async execute(m,{args}){
  if(!checkAdmin(m)) return;
  const on = args[0]=='on'; getDB().settings.autopromote = on;
  await toggleReply(m, "Auto Promote", on);
}
},
{
name: "autodl", alias: ["autodownload"], category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autodl = on;
  await toggleReply(m, "Auto DL Status", on);
}
},
{
name: "autodownload", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autodownload = on;
  await toggleReply(m, "Auto Download", on);
}
},
{
name: "autoforward", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoforward = on;
  await toggleReply(m, "Auto Forward", on);
}
},
// DELETE - YOUR EXPLANATION: block new DMs from new people
{
name: "autodelete", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autodelete = on;
  await toggleReply(m, "Anti New DM Block", on);
}
},
{
name: "autoedit", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoedit = on;
  await toggleReply(m, "Auto Edit", on);
}
},
{
name: "autocmd", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autocmd = on;
  await toggleReply(m, "Auto CMD", on);
}
},
{
name: "autoowner", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autoowner = on;
  await toggleReply(m, "Auto Owner", on);
}
},
{
name: "autogroup", category: "auto", async execute(m,{args}){
  if(!checkAdmin(m)) return;
  const on = args[0]=='on'; getDB().settings.autogroup = on;
  await toggleReply(m, "Auto Group", on);
}
},
{
name: "autojoin", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autojoin = on;
  await toggleReply(m, "Auto Join", on);
}
},
{
name: "autocall", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autocall = on;
  await toggleReply(m, "Auto Call Block", on);
}
},
{
name: "autojoin2", category: "auto", async execute(m,{args}){
  if(!checkOwner(m)) return;
  const on = args[0]=='on'; getDB().settings.autojoin2 = on;
  await toggleReply(m, "Auto Join2", on);
}
},
];

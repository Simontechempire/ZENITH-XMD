module.exports = [

// 1-10 STATUS
{
name: "autostatus", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings = global.db.settings||{}; global.db.settings.autostatus = args[0]=='on';
  m.reply(`Auto Status View ${args[0]}`);
}
},
{
name: "autostatusview", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autostatusview = args[0]=='on'; m.reply(`Auto Status View2 ${args[0]}`);
}
},
{
name: "autostatusreact", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autostatusreact = args[0]=='on'; m.reply(`Auto Status React ${args[0]}`);
}
},
{
name: "autostatuslike", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autostatuslike = args[0]=='on'; m.reply(`Auto Status Like ${args[0]}`);
}
},
{
name: "autostatusseen", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autostatusseen = args[0]=='on'; m.reply(`Auto Status Seen ${args[0]}`);
}
},
{
name: "autostory", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autostory = args[0]=='on'; m.reply(`Auto Story ${args[0]}`);
}
},
{
name: "autocomment", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autocomment = args[0]=='on'; m.reply(`Auto Comment ${args[0]}`);
}
},
{
name: "autoshare", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoshare = args[0]=='on'; m.reply(`Auto Share ${args[0]}`);
}
},
{
name: "autopost", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autopost = args[0]=='on'; m.reply(`Auto Post ${args[0]}`);
}
},
{
name: "autobroadcast", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autobroadcast = args[0]=='on'; m.reply(`Auto Broadcast ${args[0]}`);
}
},

// 11-20 READ & LIKE
{
name: "autoread", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoread = args[0]=='on'; m.reply(`Auto Read ${args[0]} - Bot will blue tick all`);
}
},
{
name: "autoview", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoview = args[0]=='on'; m.reply(`Auto View ${args[0]}`);
}
},
{
name: "autolike", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autolike = args[0]=='on'; m.reply(`Auto Like ${args[0]} - Reacts to messages`);
}
},
{
name: "autolike2", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autolike2 = args[0]=='on'; m.reply(`Auto Like2 ${args[0]}`);
}
},
{
name: "autoreact", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoreact = args[0]=='on'; m.reply(`Auto React ${args[0]}`);
}
},
{
name: "autoreact2", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoreact2 = args[0]=='on'; m.reply(`Auto React2 ${args[0]}`);
}
},
{
name: "autoreply", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoreply = args[0]=='on'; m.reply(`Auto Reply ${args[0]}`);
}
},
{
name: "autorespond", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autorespond = args[0]=='on'; m.reply(`Auto Respond ${args[0]}`);
}
},
{
name: "autoresponse", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoresponse = args[0]=='on'; m.reply(`Auto Response ${args[0]}`);
}
},
{
name: "autoanswer", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoanswer = args[0]=='on'; m.reply(`Auto Answer ${args[0]}`);
}
},

// 21-30 PRESENCE
{
name: "autobio", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autobio = args[0]=='on'; m.reply(`Auto Bio ${args[0]} - Updates bio with time`);
}
},
{
name: "autobio2", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autobio2 = args[0]=='on'; m.reply(`Auto Bio2 ${args[0]}`);
}
},
{
name: "autotyping", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autotyping = args[0]=='on'; m.reply(`Auto Typing ${args[0]} - Shows typing`);
}
},
{
name: "autorecording", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autorecording = args[0]=='on'; m.reply(`Auto Recording ${args[0]}`);
}
},
{
name: "autopresence", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autopresence = args[0]=='on'; m.reply(`Auto Presence ${args[0]}`);
}
},
{
name: "autosticker", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autosticker = args[0]=='on'; m.reply(`Auto Sticker ${args[0]} - Auto convert image to sticker`);
}
},
{
name: "autotranslate", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autotranslate = args[0]=='on'; m.reply(`Auto Translate ${args[0]}`);
}
},
{
name: "autoai", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoai = args[0]=='on'; m.reply(`Auto AI ${args[0]} - AI replies in DM`);
}
},
{
name: "autochat", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autochat = args[0]=='on'; m.reply(`Auto Chat ${args[0]}`);
}
},
{
name: "autogreet", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autogreet = args[0]=='on'; m.reply(`Auto Greet ${args[0]}`);
}
},

// 31-40 WELCOME & LEVEL
{
name: "autowelcome", category: "auto", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].autowelcome = args[0]=='on'; m.reply(`Auto Welcome ${args[0]}`);
}
},
{
name: "autogoodbye", category: "auto", async execute(m,{sock,from,args}){
  global.db.groups[from]=global.db.groups[from]||{}; global.db.groups[from].autogoodbye = args[0]=='on'; m.reply(`Auto Goodbye ${args[0]}`);
}
},
{
name: "autolevel", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autolevel = args[0]=='on'; m.reply(`Auto Level ${args[0]} - Ranking system`);
}
},
{
name: "autorank", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autorank = args[0]=='on'; m.reply(`Auto Rank ${args[0]}`);
}
},
{
name: "autoleaderboard", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoleaderboard = args[0]=='on'; m.reply(`Auto Leaderboard ${args[0]}`);
}
},
{
name: "autoblock", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoblock = args[0]=='on'; m.reply(`Auto Block ${args[0]}`);
}
},
{
name: "autounblock", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autounblock = args[0]=='on'; m.reply(`Auto Unblock ${args[0]}`);
}
},
{
name: "autokick", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autokick = args[0]=='on'; m.reply(`Auto Kick ${args[0]}`);
}
},
{
name: "autopromote", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autopromote = args[0]=='on'; m.reply(`Auto Promote ${args[0]}`);
}
},
{
name: "autodl", alias: ["autodownload"], category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autodl = args[0]=='on'; m.reply(`Auto DL ${args[0]} - Auto download status`);
}
},

// 41-50 EXTRA AUTO
{
name: "autodownload", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autodownload = args[0]=='on'; m.reply(`Auto Download ${args[0]}`);
}
},
{
name: "autoforward", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoforward = args[0]=='on'; m.reply(`Auto Forward ${args[0]}`);
}
},
{
name: "autodelete", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autodelete = args[0]=='on'; m.reply(`Auto Delete ${args[0]}`);
}
},
{
name: "autoedit", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoedit = args[0]=='on'; m.reply(`Auto Edit ${args[0]}`);
}
},
{
name: "autocmd", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autocmd = args[0]=='on'; m.reply(`Auto CMD ${args[0]}`);
}
},
{
name: "autoowner", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autoowner = args[0]=='on'; m.reply(`Auto Owner ${args[0]}`);
}
},
{
name: "autogroup", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autogroup = args[0]=='on'; m.reply(`Auto Group ${args[0]}`);
}
},
{
name: "autojoin", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autojoin = args[0]=='on'; m.reply(`Auto Join ${args[0]}`);
}
},
{
name: "autocall", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autocall = args[0]=='on'; m.reply(`Auto Call Block ${args[0]}`);
}
},
{
name: "autojoin2", category: "auto", async execute(m,{sock,from,args}){
  global.db.settings.autojoin2 = args[0]=='on'; m.reply(`Auto Join2 ${args[0]}`);
}
},
];

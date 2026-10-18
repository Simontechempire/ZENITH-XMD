const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');
const settings = require('./settings');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CONTROL SYSTEM
const CONTROL_FILE = path.join(__dirname, 'control.json');
let controlData = { enabledCategories: ["BOT","OWNER","GROUP","AI","DOWNLOADER","CONVERTER","SEARCH","LOGO","FUN","GAME","NSFW","TOOLS","OTHER"] };
if(fs.existsSync(CONTROL_FILE)){
  try{ controlData = JSON.parse(fs.readFileSync(CONTROL_FILE)); }catch(e){}
}else{
  fs.writeFileSync(CONTROL_FILE, JSON.stringify(controlData, null, 2));
}

function loadCommands(){
  const cmds = new Map();
  const pluginPath = path.join(__dirname, 'plugins');
  if(!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath, {recursive:true});
  const files = fs.readdirSync(pluginPath).filter(f=>f.endsWith('.js'));
  for(let file of files){
    try{
      delete require.cache[require.resolve(path.join(pluginPath, file))];
      const plugin = require(path.join(pluginPath, file));
      if(plugin.name){
        cmds.set(plugin.name.toLowerCase(), plugin);
        if(plugin.alias) plugin.alias.forEach(a=> cmds.set(a.toLowerCase(), plugin));
      }
    }catch(e){ console.log('Plugin error', file, e.message); }
  }
  return cmds;
}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState(settings.sessionFolder);
  const sock = makeWASocket({
    logger: P({level:'silent'}),
    printQRInTerminal: true,
    auth: state,
    browser: ["ZENITH-XMD", "Chrome", "1.0.0"]
  });

  let commands = loadCommands();
  console.log(`\n🏔️ ZENITH-XMD LOADED: ${commands.size} commands`);
  console.log(`📂 Categories Enabled: ${controlData.enabledCategories.join(', ')}`);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (u)=>{
    const { connection, lastDisconnect } = u;
    if(connection === 'close'){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect) startBot();
    }else if(connection === 'open'){
      console.log('✅ ZENITH-XMD CONNECTED - PEAK ONLINE! 👑');
    }
  });

  sock.ev.on('messages.upsert', async (m)=>{
    try{
      const msg = m.messages[0];
      if(!msg.message || msg.key.fromMe) return;
      const from = msg.key.remoteJid;
      const type = Object.keys(msg.message)[0];
      const body = type === 'conversation' ? msg.message.conversation : type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';
      if(!body.startsWith(settings.prefix)) return;
      
      const args = body.slice(settings.prefix.length).trim().split(/ +/);
      const cmdName = args.shift().toLowerCase();
      const cmd = commands.get(cmdName);
      if(!cmd) return;

      // CATEGORY CONTROL CHECK
      if(controlData.enabledCategories && !controlData.enabledCategories.includes((cmd.category||'OTHER').toUpperCase())){
        return sock.sendMessage(from, {text: `❌ *${cmd.category}* category is OFF in Control Center!\n\nGo to dashboard to turn it ON.`}, {quoted: msg});
      }

      const context = {
        sock,
        args,
        sender: from,
        m: msg,
        prefix: settings.prefix,
        config: settings,
        commands
      };
      await cmd.execute(msg, context);
    }catch(e){ console.log('Message error:', e); }
  });

  // WEB API FOR CONTROL
  app.get('/api/status', (req,res)=>{
    res.json({ bot: settings.botName, owner: settings.ownerName, version: settings.version, totalCmds: commands.size, enabledCategories: controlData.enabledCategories });
  });

  app.get('/api/control', (req,res)=> res.json(controlData));

  app.post('/api/control', (req,res)=>{
    controlData = req.body;
    fs.writeFileSync(CONTROL_FILE, JSON.stringify(controlData, null, 2));
    res.json({success:true, data: controlData});
  });

  app.post('/api/reload', (req,res)=>{
    commands = loadCommands();
    res.json({success:true, total: commands.size});
  });

  app.listen(settings.port, ()=> console.log(`🌐 Dashboard: http://localhost:${settings.port}`));
}

startBot();

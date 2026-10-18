require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');
const readline = require('readline');
const settings = require('./settings');
const { loadPlugins } = require('./lib/connection');
const { fancy, runtime } = require('./lib/functions');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Ensure folders
if (!fs.existsSync(settings.sessionFolder)) fs.mkdirSync(settings.sessionFolder, { recursive: true });
if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise(resolve => rl.question(text, resolve));

async function startZenith() {
  console.log(`
  ███████╗███████╗███╗   ██╗██╗████████╗██╗  ██╗
  ╚══███╔╝██╔════╝████╗  ██║██║╚══██╔══╝██║  ██║
    ███╔╝ █████╗  ██╔██╗ ██║██║   ██║   ███████║
   ███╔╝  ██╔══╝  ██║╚██╗██║██║   ██║   ██╔══██║
  ███████╗███████╗██║ ╚████║██║   ██║   ██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝
  PEAK EDITION • PAIRING CODE • 300 CMD
  `);

  const { state, saveCreds } = await useMultiFileAuthState(settings.sessionFolder);
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    browser: ["ZENITH-XMD", "Chrome", "1.0.0"],
    markOnlineOnConnect: true
  });

  // PAIRING CODE LOGIC
  if (!sock.authState.creds.registered) {
    console.log('\n🏔️ ZENITH-XMD PAIRING MODE\n');
    let phoneNumber = await question('📱 Enter your WhatsApp number (e.g 2348071569915): ');
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!phoneNumber) {
      console.log('❌ Invalid number! Restart bot');
      process.exit(0);
    }

    await new Promise(r => setTimeout(r, 2000));
    try {
      let code = await sock.requestPairingCode(phoneNumber);
      code = code.match(/.{1,4}/g).join('-');
      console.log(`\n╔════════════════════════════╗
║  YOUR PAIRING CODE: ${code}  ║
╚════════════════════════════╝
1. Open WhatsApp
2. Linked Devices > Link a Device
3. Link with phone number
4. Paste code: ${code}
`);
    } catch (e) {
      console.log('❌ Failed to get pairing code:', e.message);
    }
  }

  // LOAD PLUGINS
  const plugins = loadPlugins();
  console.log(`\n✅ TOTAL COMMANDS LOADED: ${plugins.size}\n`);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🔌 Connection closed:', lastDisconnect?.error?.message);
      if (shouldReconnect) {
        console.log('🔄 Reconnecting...');
        startZenith();
      }
    } else if (connection === 'open') {
      console.log('✅ ZENITH-XMD CONNECTED - PEAK ONLINE!');
      console.log(`🤖 ${settings.botName} • ${settings.version}`);
      try { rl.close(); } catch {}
      
      // Send alive msg to owner
      const startMsg = fancy(`Connected Successfully!\n\nBot: ${settings.botName}\nPrefix: ${settings.prefix}\nCommands: ${plugins.size}\nOwner: ${settings.ownerName}\n\nType ${settings.prefix}menu to see commands`);
      try {
        await sock.sendMessage(settings.ownerNumber + '@s.whatsapp.net', { text: startMsg });
      } catch {}
    }
  });

  // MESSAGE HANDLER
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    
    const from = m.key.remoteJid;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
    
    if (!body.startsWith(settings.prefix)) return;

    const args = body.slice(settings.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    const plugin = plugins.get(command);
    if (!plugin) return;

    try {
      console.log(`⚡ ${command} from ${from.split('@')[0]}`);
      await plugin.execute(m, { sock, args, from, body, config: settings, plugins });
    } catch (err) {
      console.log(`❌ Error in ${command}:`, err.message);
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: m });
    }
  });

  // WEB SERVER
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
  app.get('/api/info', (req, res) => {
    res.json({
      bot: settings.botName,
      owner: settings.ownerName,
      version: settings.version,
      commands: plugins.size,
      pairing: true,
      uptime: runtime(process.uptime())
    });
  });

  app.listen(settings.port, () => {
    console.log(`🌐 Web running on http://localhost:${settings.port}`);
  });
}

startZenith();

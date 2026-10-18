const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const { loadPlugins } = require('./plugins');

const plugins = loadPlugins();
const authFolder = path.join(__dirname, '../auth_info');

async function startBot() {
  if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });
  
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['ZENITH-XMD', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('✅ QR CODE GENERATED - Go to /qr to scan');
      // Save QR for web
      global.qrCode = qr;
    }
    
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Connection closed:', reason);
      if (reason !== DisconnectReason.loggedOut) {
        console.log('Reconnecting...');
        setTimeout(startBot, 3000);
      }
    }
    
    if (connection === 'open') {
      console.log('✅ ZENITH-XMD CONNECTED SUCCESSFULLY!');
      console.log(`📦 ${plugins.size} commands ready`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    // Your message handler here
    const m = messages[0];
    if (!m.message) return;
    
    // Load plugins logic
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if (!text.startsWith('.')) return;
    
    const cmd = text.slice(1).split(' ')[0].toLowerCase();
    const plugin = plugins.get(cmd);
    if (plugin) {
      try {
        await plugin.execute(sock, m, { plugins });
      } catch(e) {
        console.log('Plugin error:', e.message);
      }
    }
  });
}

// QR route for web
module.exports = startBot();

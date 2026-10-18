const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const fs = require('fs');

let config;
try {
  config = require('../settings');
} catch {
  config = {
    botName: "Zenith-XMD",
    ownerName: "Simon Tech Inc",
    ownerNumber: "2348071569915",
    prefix: ".",
    sessionName: "auth",
    PORT: process.env.PORT || 10000
  };
}

global.sock = null;
global.isConnected = false;
global.connectionStatus = 'Starting...';
global.pairingCode = null;
global.qrCodeData = null;
global.currentPairingNumber = null;
global.lastPairTime = 0;
global.appStarted = false;

function showZenithLogo() {
  console.log(chalk.cyan.bold(`
  ███████╗███████╗███╗   ██╗██╗████████╗██╗  ██╗
  ╚══███╔╝██╔════╝████╗  ██║██║╚══██╔══╝██║  ██║
    ███╔╝ █████╗  ██╔██╗ ██║██║   ██║   ███████║
   ███╔╝  ██╔══╝  ██║╚██╗██║██║   ██║   ██╔══██║
  ███████╗███████╗██║ ╚████║██║   ██║   ██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝
  
  ${chalk.white.bold('iPhone-iOS-XMD • PEAK EDITION • PUBLIC BOT')}
  ${chalk.yellow('2026 • LID • HD • PTV • EDIT • 365 CMDS')}
  ${chalk.gray('Owner: Simon Tech Inc • ' + config.botName)}
  `));
}

async function startConnection() {
  showZenithLogo();

  if (!global.appStarted) {
    const app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.get('/api/status', (req, res) => {
      res.json({
        botName: config.botName,
        owner: config.ownerName,
        status: global.connectionStatus,
        isConnected: global.isConnected,
        pairingCode: global.pairingCode,
        uptime: process.uptime(),
        public: true
      });
    });

    app.post('/api/pair', async (req, res) => {
      try {
        let phone = (req.body.phone || '').toString().replace(/[^0-9]/g, '');
        if (!phone || phone.length < 10) {
          return res.json({ success: false, message: 'Enter valid number e.g 2348071569915' });
        }
        if (!global.sock) return res.json({ success: false, message: 'Bot starting... wait 5 sec' });
        if (global.isConnected) return res.json({ success: false, message: 'Bot already linked!' });

        const now = Date.now();
        if (global.pairingCode && (now - global.lastPairTime) < 50000) {
          return res.json({ success: true, code: global.pairingCode, phone: global.currentPairingNumber });
        }
        if ((now - global.lastPairTime) < 8000) {
          return res.json({ success: false, message: `Wait ${Math.ceil((8000 - (now - global.lastPairTime))/1000)}s` });
        }

        global.lastPairTime = now;
        console.log(chalk.hex('#f6d365').bold(`\n💎 PUBLIC CODE for ${phone}`));

        const code = await global.sock.requestPairingCode(phone);

        global.pairingCode = code;
        global.currentPairingNumber = phone;
        global.connectionStatus = `CODE: ${code} for ${phone}`;

        console.log(chalk.green.bold(`
╔════════════════════════════╗
║  CODE   : ${code}      ║
║  NUMBER : ${phone}      ║
╚════════════════════════════╝
        `));

        res.json({ success: true, code, phone, message: 'Valid 60s - Enter NOW!' });

      } catch (err) {
        console.error(chalk.red('Pair error:'), err.message);
        res.json({ success: false, message: err.message });
      }
    });

    app.post('/api/logout', async (req, res) => {
      try { if (global.sock) await global.sock.logout(); } catch {}
      try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {}
      global.isConnected = false;
      global.pairingCode = null;
      global.connectionStatus = 'Logged out';
      res.json({ success: true });
    });

    const PORT = config.PORT || process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(chalk.cyan.bold(`\n🌐 Dashboard → http://localhost:${PORT}`));
      console.log(chalk.green.bold(`✅ PUBLIC MODE: Anyone can pair\n`));
    });
    global.appStarted = true;
  }

  async function initBaileys() {
    const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionName}`);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Safari'),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      shouldSyncHistoryMessage: () => false,
    });

    global.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'connecting') {
        global.connectionStatus = global.pairingCode ? `Waiting for code ${global.pairingCode}...` : 'Connecting...';
      }

      if (connection === 'open') {
        global.isConnected = true;
        global.connectionStatus = 'Online ✅';
        global.pairingCode = null;
        console.log(chalk.cyan.bold(`
  ███████╗███████╗███╗   ██╗██╗████████╗██╗  ██╗
  ╚══███╔╝██╔════╝████╗  ██║██║╚══██╔══╝██║  ██║
    ███╔╝ █████╗  ██╔██╗ ██║██║   ██║   ███████║
   ███╔╝  ██╔══╝  ██║╚██╗██║██║   ██║   ██╔══██║
  ███████╗███████╗██║ ╚████║██║   ██║   ██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝
        `));
        console.log(chalk.green.bold(`✅ ${config.botName} LINKED SUCCESSFULLY!\n`));
      }

      if (connection === 'close') {
        global.isConnected = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          setTimeout(() => initBaileys(), 3000);
        } else {
          try { fs.rmSync(`./${config.sessionName}`, { recursive: true, force: true }); } catch {}
          setTimeout(() => initBaileys(), 3000);
        }
      }
    });

    try {
      const functionsPath = path.join(__dirname, 'functions.js');
      if (fs.existsSync(functionsPath)) {
        const { loadCommands } = require('./functions');
        const commands = await loadCommands();
        console.log(chalk.green(`✅ Loaded ${commands.size} commands`));
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
          if (type !== 'notify') return;
          const m = messages[0];
          if (!m?.message || m.key.fromMe) return;
          const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
          if (!text.startsWith(config.prefix)) return;
          const args = text.slice(config.prefix.length).trim().split(/ +/);
          const cmdName = args.shift().toLowerCase();
          const cmd = commands.get(cmdName);
          if (cmd) {
            try { await cmd(sock, m, config, args); } catch {}
          }
        });
      }
    } catch {}
  }

  await initBaileys();
}

module.exports = { startConnection };

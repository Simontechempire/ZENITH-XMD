/**
 * ZENITH-XMD
 * Multi-Device WhatsApp Bot
 * Fixed for Render - QR + Pairing Code
 */

const fs = require('fs');
const path = require('path');
const { startConnection } = require('./lib/connection');

let config;
try {
  config = require('./settings');
} catch {
  config = {
    botName: "ZENITH-XMD",
    ownerName: "ZENITH",
    ownerNumber: "2348071569915",
    prefix: ".",
    PORT: process.env.PORT || 10000
  };
}

// ===== LOAD ALL PLUGINS FROM /plugins =====
global.plugins = new Map();
global.config = config;

function loadPlugins() {
  const pluginsPath = path.join(__dirname, 'plugins');
  if(!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
    console.log("📂 Created /plugins folder");
    return;
  }
  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));
  global.plugins.clear();
  console.log(`\n🏔️ ===== LOADING ${files.length} PLUGINS =====`);
  
  for (const file of files) {
    try {
      const fp = path.join(pluginsPath, file);
      delete require.cache[require.resolve(fp)];
      const plugin = require(fp);
      
      if(!plugin.name || !plugin.execute) {
        console.log(`⚠️ SKIP ${file}`);
        continue;
      }
      
      const allCmds = [plugin.name, ...(plugin.alias || [])];
      allCmds.forEach(cmd => {
        global.plugins.set(cmd.toLowerCase(), plugin);
      });
      
      console.log(`✅ ${file} → ${plugin.name}`);
    } catch(e) {
      console.log(`❌ ${file} failed: ${e.message}`);
    }
  }
  console.log(`🔥 ZENITH TOTAL: ${global.plugins.size} commands\n`);
}

loadPlugins();

console.log(`\n🚀 Starting ${config.botName}...`);
console.log(`👑 Owner  : ${config.ownerName}`);
console.log(`📌 Prefix : ${config.prefix}`);
console.log(`🌐 Port   : ${config.PORT}\n`);

startConnection().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

process.on('uncaughtException', (e) => console.log('Uncaught:', e.message));

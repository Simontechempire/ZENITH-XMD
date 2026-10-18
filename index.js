/**
 * ZENITH-XMD
 * Multi-Device WhatsApp Bot
 * Fixed for Render - QR + Pairing Code + Recursive Plugins
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

// ===== LOAD ALL PLUGINS FROM /plugins - RECURSIVE FIX =====
global.plugins = new Map();
global.config = config;

function loadPlugins() {
  const pluginsPath = path.join(__dirname, 'plugins');
  if(!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
    console.log("📂 Created /plugins folder");
    return;
  }
  
  global.plugins.clear();
  let fileCount = 0;

  function readDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readDir(fullPath);
      } else if (item.endsWith('.js')) {
        fileCount++;
        try {
          delete require.cache[require.resolve(fullPath)];
          const plugin = require(fullPath);
          
          if(!plugin.name || !plugin.execute) {
            console.log(`⚠️ SKIP ${item} - no name/execute`);
            continue;
          }
          
          const allCmds = [plugin.name, ...(plugin.alias || [])];
          allCmds.forEach(cmd => {
            global.plugins.set(cmd.toLowerCase(), plugin);
          });
          
          console.log(`✅ ${item} → ${plugin.name}`);
        } catch(e) {
          console.log(`❌ ${item} failed: ${e.message}`);
        }
      }
    }
  }

  console.log(`\n🏔️ ===== SCANNING PLUGINS FOLDER =====`);
  readDir(pluginsPath);
  console.log(`🔥 ZENITH TOTAL: ${global.plugins.size} commands from ${fileCount} files\n`);
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

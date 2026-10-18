const fs = require('fs');
const path = require('path');

function loadPlugins() {
  const pluginMap = new Map();
  const pluginsDir = path.join(__dirname, '../plugins');
  
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
    return pluginMap;
  }

  console.log(`
  ███████╗███████╗███╗   ██╗██╗████████╗██╗  ██╗
  ╚══███╔╝██╔════╝████╗  ██║██║╚══██╔══╝██║  ██║
    ███╔╝ █████╗  ██╔██╗ ██║██║   ██║   ███████║
   ███╔╝  ██╔══╝  ██║╚██╗██║██║   ██║   ██╔══██║
  ███████╗███████╗██║ ╚████║██║   ██║   ██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝
  
  iPhone-iOS-XMD • PUBLIC • 2026 EDITION
  `);

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  console.log(`📂 Found ${files.length} plugin files...`);

  let totalCmds = 0;
  for (const file of files) {
    try {
      const filePath = path.join(pluginsDir, file);
      delete require.cache[require.resolve(filePath)];
      const plugins = require(filePath);
      const list = Array.isArray(plugins) ? plugins : [plugins];
      
      list.forEach(p => {
        if (p && p.name) {
          pluginMap.set(p.name.toLowerCase(), p);
          if (p.alias && Array.isArray(p.alias)) {
            p.alias.forEach(alias => {
              pluginMap.set(alias.toLowerCase(), p);
            });
          }
          totalCmds++;
        }
      });
      
      console.log(`✅ ${file} -> ${list.length} commands`);
    } catch (e) {
      console.log(`❌ Failed to load ${file}:`, e.message);
    }
  }
  
  console.log(`\n🏔️ ZENITH-XMD TOTAL: ${pluginMap.size} UNIQUE CMDS / ${totalCmds} LOADED`);
  console.log(`📅 2026 Features: LID, HD, PTV, EDIT, NEWSLETTER Ready\n`);
  
  return pluginMap;
}

module.exports = { loadPlugins };

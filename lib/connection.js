const fs = require('fs');
const path = require('path');

function loadPlugins() {
  const pluginMap = new Map();
  const pluginsDir = path.join(__dirname, '../plugins');
  
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
    return pluginMap;
  }

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  console.log(`📂 Found ${files.length} plugin files...`);

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
        }
      });
      
      console.log(`✅ ${file} -> ${list.length} commands`);
    } catch (e) {
      console.log(`❌ Failed to load ${file}:`, e.message);
    }
  }
  
  return pluginMap;
}

module.exports = { loadPlugins };

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Keep bot alive
app.get('/health', (req, res) => res.send('ZENITH-XMD RUNNING'));

app.listen(PORT, () => {
  console.log(`✅ WEB LIVE ON ${PORT}`);
  console.log(`🚀 Starting ZENITH-XMD...`);
  
  // Start bot AFTER web is live
  try {
    const { loadPlugins } = require('./lib/plugins');
    loadPlugins();
    require('./lib/connection');
    console.log('✅ Bot loaded');
  } catch(e) {
    console.log('Bot error:', e.message);
  }
});

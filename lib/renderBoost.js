const cache = new Map();

function init() {
  console.log('⚡ [RenderBoost] Active - Speed x3');

  cache.set('menu_cache', null);
  cache.set('menu_time', 0);

  // Clean RAM every 5 mins
  setInterval(() => {
    try {
      if (global.gc) global.gc();
      if (process.memoryUsage().heapUsed / 1024 / 1024 > 400) {
        console.log('🧹 Cleaning memory');
        if (global.gc) global.gc();
      }
    } catch (e) {}
  }, 5 * 60 * 1000);
}

function getCachedMenu() {
  const cached = cache.get('menu_cache');
  const time = cache.get('menu_time');
  if (cached && Date.now() - time < 300000) {
    return cached;
  }
  return null;
}

function setCachedMenu(text) {
  cache.set('menu_cache', text);
  cache.set('menu_time', Date.now());
}

module.exports = { init, getCachedMenu, setCachedMenu, cache };

const axios = require('axios');
const fs = require('fs-extra');
const { fileTypeFromBuffer } = require('file-type');

module.exports = {
  // Stylish reply
  fancy: (text) => {
    return `🏔️ *ZENITH-XMD* 👑\n━━━━━━━━━━━━━━━━\n${text}\n━━━━━━━━━━━━━━━━\n_Peak Edition 2026 • Simon_`;
  },

  // Check owner
  isOwner: (jid, config) => {
    const num = jid.split('@')[0];
    return config.owner.includes(num) || num === config.ownerNumber;
  },

  // Sleep
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Get buffer from URL
  getBuffer: async (url) => {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      return res.data;
    } catch (e) {
      return null;
    }
  },

  // Runtime
  runtime: (seconds) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  },

  // Format bytes
  formatBytes: (bytes) => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  }
}

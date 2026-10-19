require('dotenv').config();

// ⚡ RENDER SPEED BOOST
try { require('./lib/renderBoost').init(); } catch (e) {}

module.exports = {
  // ===== CORE BRANDING =====
  botName: process.env.BOT_NAME || "ZENITH-XMD",
  botImage: process.env.BOT_IMAGE || "https://files.catbox.moe/2y4q3b.jpg",
  menuImage: process.env.MENU_IMAGE || "https://files.catbox.moe/2y4q3b.jpg",
  ownerName: "Simon",
  ownerNumber: process.env.OWNER_NUMBER || "2348071569915",
  owner: ["2348071569915"],
  sudo: ["2348071569915"],
  allowedNumbers: ["2348071569915"],
  
  // ===== PREFIX & VERSION =====
  prefix: ".",
  version: "V2 • Peak Edition • 2026 • 365 CMD • iOS",
  sessionFolder: "auth",
  sessionName: "auth",
  port: process.env.PORT || 10000,
  PORT: process.env.PORT || 10000,

  // ===== MODES =====
  public: true,
  pairing: true,
  publicMode: true,
  protectIp: false,
  mode: "public",

  // ===== WHATSAPP LID & NEW FEATURES =====
  lidSupport: true,
  hdEnabled: true,
  ptvEnabled: true,
  editEnabled: true,
  newsletterEnabled: true,
  pollV2Enabled: true,
  callLinkEnabled: true,
  disappear90Enabled: true,

  // ===== AUTO DEFAULTS - OPTIMIZED FOR RENDER SPEED =====
  autoread: false,
  autostatus: false, // <-- Changed to false for speed
  autovv: false,
  autolike: false,
  autoreact: false,
  autotyping: false,
  autorecording: false,
  autopresence: false,
  autoreply: false,
  anticall: true,
  antidelete: false,
  caption: "© 2026 ZENITH-XMD PEAK",
  footer: "⚡ Powered by Simon",
  menuType: "image",

  // ===== MESSAGES =====
  mess: {
    owner: "👑 Owner only command - Simon only!",
    group: "👥 Group only command!",
    admin: "⛔ Only group admin are authorised to use this commands",
    botAdmin: "🤖 Make bot admin first!",
    premium: "💎 Premium only!",
    wait: "⏳ ZENITH-XMD processing...",
    link: "❌ This is not a valid link!",
    error: "❌ Error! Try again later",
    banned: "⛔ You are banned from using bot",
    done: "✅ Successful"
  }
}

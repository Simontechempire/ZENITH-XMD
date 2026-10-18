require('dotenv').config();

module.exports = {
  // BOT INFO - ZENITH
  botName: process.env.BOT_NAME || "ZENITH-XMD",
  ownerName: "Simon",
  ownerNumber: process.env.OWNER_NUMBER || "2348071569915",
  
  // CORE
  prefix: ".",
  version: "V2 • Peak Edition • 2026 • 365 CMD • iOS",
  sessionFolder: "auth",
  sessionName: "auth",
  port: process.env.PORT || 10000,
  PORT: process.env.PORT || 10000,

  // OWNER LIST
  owner: ["2348071569915"],
  ownerNumber: process.env.OWNER_NUMBER || "2348071569915",
  allowedNumbers: ["2348071569915"], // for owner-only mode if you enable later

  // MODE
  public: true,
  pairing: true, // PAIRING CODE MODE - NOT QR
  publicMode: true,
  protectIp: false, // false = public can pair, true = owner only

  // 2026 FEATURES - MUST ADD FOR HOST
  lidSupport: true,        // WhatsApp new LID privacy 2026
  hdEnabled: true,         // HD images/videos
  ptvEnabled: true,        // PTV (video note)
  editEnabled: true,       // Message edit tracking
  newsletterEnabled: true, // Channels/Newsletter
  pollV2Enabled: true,      // Poll v2/v3
  callLinkEnabled: true,   // Call links
  disappear90Enabled: true, // 90 days disappearing

  // MESSAGES
  mess: {
    owner: "👑 Owner only command - Simon only!",
    group: "👥 Group only command!",
    admin: "🔰 Admin only!",
    botAdmin: "🤖 Make bot admin first!",
    premium: "💎 Premium only!",
    wait: "⏳ ZENITH-XMD processing..."
  },

  // LOGO
  logo: `
  ███████╗███████╗███╗   ██╗██╗████████╗██╗  ██╗
  ╚══███╔╝██╔════╝████╗  ██║██║╚══██╔══╝██║  ██║
    ███╔╝ █████╗  ██╔██╗ ██║██║   ██║   ███████║
   ███╔╝  ██╔══╝  ██║╚██╗██║██║   ██║   ██╔══██║
  ███████╗███████╗██║ ╚████║██║   ██║   ██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝
  `
}

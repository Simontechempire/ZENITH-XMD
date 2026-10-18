require('dotenv').config();

module.exports = {
  botName: process.env.BOT_NAME || "ZENITH-XMD",
  ownerName: "Simon",
  ownerNumber: process.env.OWNER_NUMBER || "2348071569915",
  owner: ["2348071569915"],
  allowedNumbers: ["2348071569915"],
  
  prefix: ".",
  version: "V2 • Peak Edition • 2026 • 365 CMD • iOS",
  sessionFolder: "auth",
  sessionName: "auth",
  port: process.env.PORT || 10000,
  PORT: process.env.PORT || 10000,

  public: true,
  pairing: true,
  publicMode: true,
  protectIp: false,

  lidSupport: true,
  hdEnabled: true,
  ptvEnabled: true,
  editEnabled: true,
  newsletterEnabled: true,
  pollV2Enabled: true,
  callLinkEnabled: true,
  disappear90Enabled: true,

  mess: {
    owner: "👑 Owner only command - Simon only!",
    group: "👥 Group only command!",
    admin: "🔰 Admin only!",
    botAdmin: "🤖 Make bot admin first!",
    premium: "💎 Premium only!",
    wait: "⏳ ZENITH-XMD processing..."
  }
}

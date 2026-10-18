require('dotenv').config();

module.exports = {
  // BOT INFO
  botName: process.env.BOT_NAME || "ZENITH-XMD",
  ownerName: "Simon",
  ownerNumber: process.env.OWNER_NUMBER || "2348071569915",
  
  // CORE
  prefix: ".",
  version: "V1 • Peak Edition • Pairing • 300 CMD",
  sessionFolder: "auth",
  port: process.env.PORT || 10000,

  // OWNER LIST
  owner: ["2348071569915"],

  // MODE
  public: true,
  pairing: true, // PAIRING CODE MODE - NOT QR

  // MESSAGES
  mess: {
    owner: "👑 Owner only command - Simon only!",
    group: "👥 Group only command!",
    admin: "🔰 Admin only!",
    botAdmin: "🤖 Make bot admin first!",
    premium: "💎 Premium only!",
    wait: "⏳ ZENITH-XMD processing..."
  }
}

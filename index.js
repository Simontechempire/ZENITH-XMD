/**
 * ZENITH-XMD PEAK V2 - FIXED
 * Entry - No delay, Fast Pairing
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { startConnection } = require('./lib/connection');

let config;
try { config = require('./settings'); } catch {
  config = {
    botName: "ZENITH-XMD",
    ownerName: "Simon",
    ownerNumber: "2348071569915",
    prefix: ".",
    PORT: process.env.PORT || 10000
  };
}

global.config = config;
global.plugins = new Map();

// ✅ Show pairing number immediately so you know which number to enter code for
const PAIR_NUMBER = (process.env.PHONE_NUMBER || process.env.PAIR_NUMBER || config.ownerNumber).replace(/[^0-9]/g,'');

console.log(chalk.cyan.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ ⚡ ZENITH-XMD PEAK V2    ┃
┃ 365 CMD • iOS • 2026     ┃
┃ Owner: ${config.ownerName} | Prefix: ${config.prefix} ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`));
console.log(chalk.green(`🚀 Starting ${config.botName}...`));
console.log(chalk.yellow(`📱 Pairing Number: ${PAIR_NUMBER}`));
console.log(chalk.yellow(`🌐 Port: ${config.PORT}`));
console.log(chalk.yellow(`⏳ Pairing code go show in 2-3 seconds...\n`));

// ✅ REMOVED renderBoost - e dey cause delay / hang
// ✅ REMOVED memory setInterval - e dey waste CPU for Render

// ✅ Start immediately, no delay
startConnection().catch(err => {
  console.error(chalk.red('❌ Failed to start:'), err.message);
  // Retry fast - 2s not 5s
  setTimeout(() => startConnection(), 2000);
});

process.on('uncaughtException', (e) => console.log(chalk.red('Uncaught:'), e.message));
process.on('unhandledRejection', (e) => console.log(chalk.yellow('Unhandled:'), e?.message || e));

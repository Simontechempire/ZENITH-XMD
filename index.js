/**
 * ZENITH-XMD PEAK V2
 * Entry - Optimized for Render + Katabump FAST REPLY
 */
require('dotenv').config();

// ⚡ SPEED BOOST - MUST BE FIRST
try { 
  require('./lib/renderBoost').init(); 
  console.log('⚡ Speed booster loaded in index.js');
} catch (e) { 
  console.log('⚠️ renderBoost not found, create lib/renderBoost.js');
}

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

console.log(chalk.cyan.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ ⚡ ZENITH-XMD PEAK V2    ┃
┃ 365 CMD • iOS • 2026     ┃
┃ Owner: ${config.ownerName} | Prefix: ${config.prefix} ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`));

console.log(chalk.green(`🚀 Starting ${config.botName}...`));
console.log(chalk.yellow(`📂 Plugins will be wired inside connection.js`));
console.log(chalk.yellow(`🌐 Port: ${config.PORT}\n`));

// Auto restart if memory too high (Render 512MB fix)
setInterval(() => {
  const mem = process.memoryUsage().heapUsed / 1024 / 1024;
  if (mem > 450) {
    console.log(chalk.red(`⚠️ High memory ${mem.toFixed(0)}MB - cleaning...`));
    if (global.gc) global.gc();
  }
}, 60000);

startConnection().catch(err => {
  console.error(chalk.red('❌ Failed to start:'), err);
  setTimeout(() => startConnection(), 5000);
});

process.on('uncaughtException', (e) => console.log(chalk.red('Uncaught:'), e.message));
process.on('unhandledRejection', (e) => console.log(chalk.yellow('Unhandled:'), e?.message || e));

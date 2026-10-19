/**
 * ZENITH-XMD PEAK V2
 * Entry - Fixed for Render + Koyeb + Railway
 * ARRAY + Single + Recursive Support
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

console.log(chalk.cyan.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ ⚡ ZENITH-XMD PEAK V2    ┃
┃ 365 CMD • iOS • 2026     ┃
┃ Owner: ${config.ownerName} | Prefix: ${config.prefix} ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`));

// We leave plugin loading to connection.js to avoid duplicate
// connection.js already does recursive ARRAY scan
console.log(chalk.green(`🚀 Starting ${config.botName}...`));
console.log(chalk.yellow(`📂 Plugins will be wired inside connection.js`));
console.log(chalk.yellow(`🌐 Port: ${config.PORT}\n`));

startConnection().catch(err => {
  console.error(chalk.red('❌ Failed to start:'), err);
  setTimeout(() => startConnection(), 5000);
});

process.on('uncaughtException', (e) => console.log(chalk.red('Uncaught:'), e.message));
process.on('unhandledRejection', (e) => console.log(chalk.yellow('Unhandled:'), e.message));

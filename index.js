const { startConnection } = require('./lib/connection');

console.log('🚀 Starting ZENITH-XMD...');
startConnection();

process.on('uncaughtException', e => console.error(e));
process.on('unhandledRejection', e => console.error(e));

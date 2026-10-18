const conn = require('./lib/connection');

console.log('🚀 Starting ZENITH-XMD...');

if (conn.startConnection) conn.startConnection();
else if (conn.startBot) conn.startBot();
else if (typeof conn === 'function') conn();
else console.log('Export:', Object.keys(conn));

process.on('uncaughtException', e => console.error(e));
process.on('unhandledRejection', e => console.error(e));

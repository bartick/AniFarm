const sqlite3 = require('better-sqlite3');

const db = new sqlite3('./utils/database.db');
console.log('Connected to sqlite db');


module.exports = db
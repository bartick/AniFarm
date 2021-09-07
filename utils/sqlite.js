const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./utils/database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});


module.exports = db
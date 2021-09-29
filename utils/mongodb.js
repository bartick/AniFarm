const mongoose = require('mongoose');
require('dotenv').config({path: __dirname+'./../.env'});

const conn = mongoose.createConnection(process.env.DB_URL, {
    minPoolSize: 1,
    maxPoolSize: 1,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
});

conn.model('orders', require('./../schemas/orders'));
conn.model('settings', require('./../schemas/settings'));

conn.on('connected', () => {
    console.log('Connected to discordData database.')
})

module.exports = conn;
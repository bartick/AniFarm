const mongoose = require('mongoose');
require('dotenv').config({path: __dirname+'./../.env'});

const conn = mongoose.createConnection(process.env.P_DB_URL, {
    minPoolSize: 1,
    maxPoolSize: 1,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
});

conn.model('anifarm', require('./../schemas/anifarm'));

conn.on('connected', () => {
    console.log('Connected to profile database.')
})

module.exports = conn;
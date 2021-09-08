const mongoose = require('mongoose');

module.exports = mongoose.model('settings', new mongoose.Schema({
    _id: Number
},
{collection: 'settings', versionKey: false}
));
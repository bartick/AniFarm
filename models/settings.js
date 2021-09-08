const mongoose = require('mongoose');

module.exports = mongoose.model('settings', new mongoose.Schema({
    _id: Number,
    order: {
        type: Number,
        default: 0
    },
    pending: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0
    },
    complete: {
        type: Number,
        default: 0
    },
    roles: {
        type: Object
    }
},
{collection: 'settings', versionKey: false}
));
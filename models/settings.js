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
        type: Map,
        of: Number,
        default: {
            vacant: 0,
            occupied: 0,
            unavailable: 0
        }
    },
    prices: {
        type: Array,
        default: []
    },
    discounts: {
        type: Map,
        of: Number,
        default: {
            role: {},
            orders: {}
        }
    }
},
{collection: 'settings', versionKey: false}
));
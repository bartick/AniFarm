const mongoose = require('mongoose');

// Array(end - start + 1).fill().map((_, idx) => start + idx);

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
            farmer: 0,
            vacant: 0,
            occupied: 0,
            unavailable: 0
        }
    },
    prices: {
        type: Map,
        of: Array,
        default: {}
    },
    discounts: {
        type: Map,
        of: Map,
        default: {
            role: {},
            orders: {},
            server: {}
        }
    },
},
{collection: 'settings', versionKey: false}
));
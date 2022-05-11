import mongoose from 'mongoose';

// Array(end - start + 1).fill().map((_, idx) => start + idx);

// 'settings'
export default new mongoose.Schema({
    _id: Number,
    order: {
        type: String,
        default: "0"
    },
    pending: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        default: "0"
    },
    complete: {
        type: String,
        default: "0"
    },
    farmer: {
        type: String,
        default: "0"
    },
    vacant: {
        type: String,
        default: "0"
    },
    occupied: {
        type: String,
        default: "0"
    },
    unavailable: {
        type: String,
        default: "0"
    },
    prices: {
        type: Map,
        of: Array,
        default: {}
    },
    disRole: {
        type: Map,
        default: {}
    },
    disOrder: {
        type: Map,
        default: {}
    },
    disServer: {
        type: Map,
        default: {
            next: 0,
            discount: 0
        }
    }
},
{collection: 'settings', versionKey: false}
);
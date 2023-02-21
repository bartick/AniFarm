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
    },
    soul: {
        type: Number,
        default: 0
    }
},
{collection: 'settings', versionKey: false}
);

export interface SettingsType extends mongoose.Document {
    _id: number;
    order: string;
    pending: string;
    status: string;
    complete: string;
    farmer: string;
    vacant: string;
    occupied: string;
    unavailable: string;
    prices: Map<string, number[]>;
    disRole: Map<string, number>;
    disOrder: Map<string, number>;
    disServer: Map<string, number>;
    soul: number;
}
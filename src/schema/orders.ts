import mongoose from 'mongoose';
// 'orders'
export default new mongoose.Schema({
    orderid: Number,
    guildid: String,
    name: {
        type: String
    },
	image: {
        type: String
    },
	farmer: {
        type: String
    },
	farmerid: {
        type: String,
        default: "0"
    },
	customerid: {
        type: String
    },
    pending: {
        type: String
    },
	pendingid: {
        type: String,
        default: "0"
    },
	status: {
        type: String
    },
	statusid: {
        type: String,
        default: "0"
    },
    complete: {
        type: String
    },
	amount: {
        type: Number
    },
	price: {
        type: Number
    },
	discount: {
        type: Number,
        default: 0
    },
	location: {
        type: Number
    },
	floor: {
        type: Number
    },
	amount_farmed: {
        type: Number,
        default: 0
    },
    flash: {
        type: Map,
        of: Number,
        default: {
            number: 0,
            total: 0
        }
        
    }
},
{collection: 'orders', versionKey: false, timestamps: true}
);

export interface OrdersType extends mongoose.Document {
    _id: string;
    orderid: number;
    guildid: string;
    name: string;
    image: string;
    farmer: string;
    farmerid: string;
    customerid: string;
    pending: string;
    pendingid: string;
    status: string;
    statusid: string;
    complete: string;
    amount: number;
    price: number;
    discount: number;
    location: number;
    floor: number;
    amount_farmed: number;
    flash: {
        number: number,
        total: number
    }
}
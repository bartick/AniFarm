const mongoose = require('mongoose');

module.exports = mongoose.model('orders', new mongoose.Schema({
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
));
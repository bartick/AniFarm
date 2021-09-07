const mongoose = require('mongoose')

module.exports = mongoose.model('anifarm', new mongoose.Schema({
        _id: Number,
        farmed: {
            type: Number,
            default: 0
        },
        ordered: {
            type: Number,
            default: 0
        },
        pimage: {
            type: String,
            default: ""
        },
        pstatus: {
            type: String,
            default: ""
        },
        avg: {
            type: Number,
            default: 200
        },
        speed: {
            type: Number,
            default: 2
        },
        badges: {
            type: Array,
            default: []
        },
        setBadges: {
            type: String,
            default: ""
        }

    },
    {
        collection: 'anifarm',
        versionKey: false,
        timestamps: true
    })
);
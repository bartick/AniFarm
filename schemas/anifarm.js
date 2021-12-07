'use strict';
const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;
// 'anifarm'
module.exports = new mongoose.Schema({
        _id: Long,
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
        },
        rating: {
            type: Map,
            of: Array,
            default: {
                1: [],
                2: [],
                3: [],
                4: [],
                5: []
            }
        }

    },
    {
        collection: 'anifarm',
        versionKey: false
    });
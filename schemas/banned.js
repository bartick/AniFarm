'use strict';
const mongoose = require('mongoose');
// 'banned'
module.exports = new mongoose.Schema({
        _id: Number
    },
    {
        collection: 'banned',
        versionKey: false,
        timestamps: true
    });
const mongoose = require('mongoose');

module.exports = mongoose.model('banned', new mongoose.Schema({
        _id: Number
    },
    {
        collection: 'banned',
        versionKey: false,
        timestamps: true
    })
);
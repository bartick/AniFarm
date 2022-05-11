import mongoose from 'mongoose';

// 'banned'
export default new mongoose.Schema({
        _id: Number
    },
    {
        collection: 'banned',
        versionKey: false,
        timestamps: true
    }
);
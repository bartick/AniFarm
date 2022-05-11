import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Anifarm } from '../schema';

const conn: mongoose.Connection = mongoose.createConnection(process.env.P_DB_URL as string, {
    minPoolSize: 1,
    maxPoolSize: 1,
    ssl: true,
    sslValidate: false,
});

conn.model('anifarm', Anifarm);

conn.on('connected', () => {
    console.log('Connected to profile database.')
})

export default conn;
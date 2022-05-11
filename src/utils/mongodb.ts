import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {Orders, Settings} from './../schema'

dotenv.config();

const conn: mongoose.Connection = mongoose.createConnection(process.env.DB_URL as string, {
    minPoolSize: 1,
    maxPoolSize: 1,
    ssl: true,
    sslValidate: false,
});

conn.model('orders', Orders);
conn.model('settings', Settings);

conn.on('connected', () => {
    console.log('Connected to discordData database.')
})

export default conn;
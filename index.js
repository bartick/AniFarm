'use strict';
require('dotenv').config({path: './.env'});
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS
    ] 
});

client.commands = new Collection();
client.power = [];
client.ordered = {};

// Global Command
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}
// Owner Only
const privateFiles = fs.readdirSync('./private/commands').filter(file => file.endsWith('.js'));
for (const file of privateFiles) {
    const command = require(`./private/commands/${file}`);
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.TOKEN);
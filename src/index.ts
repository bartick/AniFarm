const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ] 
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.login(process.env.TOKEN);
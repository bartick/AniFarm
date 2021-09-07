const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, profile } = require('./config.json');
const mongoose = require('mongoose');

mongoose.connect(profile.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB')
}).catch((err) => {
  console.log('Unable to connect to MongoDB Database.\nError: ' + err)
});

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS
    ] 
});

client.commands = new Collection();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
    client.user.setActivity("over AniGame farming", {type: "WATCHING"})
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command! ', ephemeral: true });
        }
    }
});

client.login(token);
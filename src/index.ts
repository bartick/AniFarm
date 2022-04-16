import { Client, Intents, Collection } from 'discord.js';
import { ClientUser } from './interfaces'
import dotenv from 'dotenv';
import events from './events';
import commands from "./commands";

dotenv.config();

const client: ClientUser = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
	]
});

client.commands = new Collection();
client.power = [];

for (const command of commands) {
	client.commands.set(command.data.name, command);
}

for (const event of events) {
	if (event.once) {
		client.once(event.name, event.execute);
	}
	else {
		client.on(event.name, event.execute);
	}
}


client.login(process.env.TOKEN);
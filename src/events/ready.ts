import { Client } from 'discord.js';
import { Event } from '../interfaces';

const ready: Event = {
	name: 'ready',
	once: true,
	execute(client: Client) {
		console.log(`Logged in as ${client.user?.tag}`);
	}
};

export default ready;
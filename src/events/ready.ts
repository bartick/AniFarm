import { Client } from 'discord.js';
import { Event } from '../interfaces';

const ready: Event = {
	name: 'ready',
	once: true,
	execute(client: Client) {
		console.log(`Logged in as ${client.user?.tag}`);
		client?.user?.setActivity('over your server', { type: 'WATCHING' });
	}
};

export default ready;
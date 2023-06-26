import { ClientUser, Event } from '../interfaces';

const ready: Event = {
	name: 'ready',
	once: true,
	execute(client: ClientUser) {
		console.log(`Logged in as ${client.user?.username}`);
	}
};

export default ready;
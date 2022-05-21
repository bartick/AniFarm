import { Client, Intents, Collection, LimitedCollection } from 'discord.js';
import { ClientUser } from './interfaces'
import dotenv from 'dotenv';
import * as events from './events';
import * as commands from "./commands";
import * as buttonCommands from './buttonCommands';

dotenv.config();

const client: ClientUser = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
	],
	makeCache: manager => {
		if ([
			'MessageManager', 
			'GuildScheduledEventManager', 
			'GuildStickerManager', 
			'GuildInviteManager', 
			'GuildBanManager',
			'PresenceManager',
			'ReactionManager',
			'ReactionUserManager',
			'StageInstanceManager',
			'ThreadManager',
			'ThreadMemberManager',
			'VoiceStateManager'
			].indexOf(manager.name) >= 0) return new LimitedCollection({ maxSize: 0 });
		return new Collection();
	},
	presence: {
		activities: [
			{
				name: 'over AniGame Farming',
				type: 'WATCHING',
			},
		]
	}
});

client.commands = new Collection();
client.buttons = new Collection();
client.rateLimit = new Map();
client.power = [];

for (const command in commands) {
	client.commands.set(commands[command as keyof typeof commands].data.name, commands[command as keyof typeof commands]);
}

for (const buttons in buttonCommands) {
	client.buttons.set(buttonCommands[buttons as keyof typeof buttonCommands].name, buttonCommands[buttons as keyof typeof buttonCommands]);
	client.rateLimit.set(buttonCommands[buttons as keyof typeof buttonCommands].name, []);
}

for (const event in events) {
	if (events[event as keyof typeof events].once) {
		client.once(events[event as keyof typeof events].name, events[event as keyof typeof events].execute);
	}
	else {
		client.on(events[event as keyof typeof events].name, events[event as keyof typeof events].execute);
	}
}


client.login(process.env.TOKEN);
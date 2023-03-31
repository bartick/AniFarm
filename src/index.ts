import { Client, GatewayIntentBits, Collection, LimitedCollection, ActivityType } from 'discord.js';
import { ClientUser } from './interfaces'
import dotenv from 'dotenv';
import * as events from './events';
import * as commands from "./commands";
import * as buttonCommands from './buttonCommands';

dotenv.config();

const client: ClientUser = new Client<true>({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
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
				type: ActivityType.Watching,
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
	if (commands[command as keyof typeof commands].rateLimitName) client.rateLimit.set(commands[command as keyof typeof commands].rateLimitName as string, []);
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
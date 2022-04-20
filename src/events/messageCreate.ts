import { Message } from 'discord.js';
import { Event } from '../interfaces';


function checkMention(mention:string, userId: string | undefined): boolean {
    if(mention.match(/<@!?(\d{17,19})>/g)) {
        const id = mention[2] === '!' ? mention.slice(3, -1) : mention.slice(2, -1);
        return id === userId;
    }
    return false;
}

const messageCreate: Event = {
    name: 'messageCreate',
    async execute(message: Message) {
        if (message.author.bot) return;
        if(message.content===null || message.content===undefined) return;
        const content = message.content.toLowerCase().split(/\s+/);
        if (checkMention(content[0], message.client.user?.id) && content[1]) {
            await message.channel.send(`${message.author}`);
        }
    }
}

export default messageCreate;
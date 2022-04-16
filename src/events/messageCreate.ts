// const { MessageEmbed } = require('discord.js');
import { Event } from '../interfaces';

const messageCreate: Event = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        if(message.content===null || message.content===undefined) return;
        const content = message.content.toLowerCase().split(/\s+/);
        if (message.mentions.has(message.client.user) && content[1]) {
            console.log(content);
            await message.channel.send(`${message.author}`);
        }
    }
}

export default messageCreate;
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

const ping = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows Bot Latency 🏓'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply(`🏓 WS: ${"`"}${interaction.client.ws.ping}${"`"} ms`);
    },
};

export default ping;
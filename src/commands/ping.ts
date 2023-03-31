import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CustomCommandInteraction } from './../interfaces';

const ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows Bot Latency 🏓'),
    async execute(interaction: CustomCommandInteraction) {
        await interaction.reply(`🏓 WS: ${"`"}${interaction.client.ws.ping}${"`"} ms`);
    },
};

export default ping;
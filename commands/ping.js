'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows Bot Latency 🏓'),
    async execute(interaction) {
        await interaction.reply(`🏓 WS: ${"`"}${interaction.client.ws.ping}${"`"} ms`);
    },
};
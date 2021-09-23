'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Check the info about the bot in different servers.'),
    async execute(interaction) {
        await interaction.deferReply()
        const size = interaction.client.guilds.cache.size;
        const ram = process.memoryUsage().heapUsed / 1024 / 1024;
        await interaction.editReply(`I am in ${size} servers.\nI am approximately using ${Math.round(ram * 100) / 100} MB`)
    }
};
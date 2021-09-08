const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows Bot Latency 🏓'),
    async execute(interaction) {
        await interaction.reply('🏓 Pong');
        await wait(1500);
        await interaction.editReply(`🏓 WS: ${"`"}${interaction.client.ws.ping}${"`"}`);
    },
};
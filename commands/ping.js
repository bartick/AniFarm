const { SlashCommandBuilder } = require('@discordjs/builders');
const anifarm = require('./../models/anifarm')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows Bot Latency 🏓'),
    async execute(interaction) {
        await interaction.reply(`🏓 WS: ${interaction.client.ws.ping}`)
        const d = await anifarm.findById(interaction.user.id).exec();
        console.log(d);
    },
};
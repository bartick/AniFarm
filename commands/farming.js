const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('farming')
            .setDescription('Shows what you are farming'),
    async execute(interaction) {
        //TODO: show what the farmer is farming
    }
};
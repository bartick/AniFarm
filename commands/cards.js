const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('card')
        .setDescription('Get the number of cards needed to reach from level x to level y')
        .addStringOption(option => 
            option.setName('levels')
            .setDescription('Provide the levels to get information')
            .setRequired(true)
        ),
    async execute(interaction) {
        //TODO
    }
}
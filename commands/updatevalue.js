const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
            .setName('updatevalue')
            .setDescription('Update the amount of cards you have farmed')
            .addIntegerOption(option => 
                option.setName('value')
                .setDescription('Add the new value')
                .setRequired(true)
            ),
    async execute(interaction) {
        //TODO: complete intregation
    }
};
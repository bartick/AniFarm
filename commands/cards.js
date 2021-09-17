const { SlashCommandBuilder } = require('@discordjs/builders');
const sqldb = require('./../utils/sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('Get the number of cards needed to reach from level x to level y')
        .addStringOption(option => 
            option.setName('levels')
            .setDescription('Provide the levels to get information')
            .setRequired(true)
        ),
    async execute(interaction) {
        const levels = interaction.options.getString('levels').trim().split(/\s/);
        await interaction.reply("Hello");
        if(levels.length==2 && NaN(levels[0]) && !(NaN(levels[1]))) {
            //TODO
        }
        else {
            if (levels.length%2 !== 0) {
                //ERROR
            }
            else {
                //TODO
            }
        }
    }
}
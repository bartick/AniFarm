const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Change your role according to the status of farming you are doing.')
        .addStringOption( option => 
            option.setName('name')
            .setDescription('Name of the role')
            .addChoice('vacant', 'vacant')
            .addChoice('occupied', 'occupied')
            .addChoice('unavailable', 'unavailable')
        ),
    async execute(interaction) {
        //TODO
    }
}
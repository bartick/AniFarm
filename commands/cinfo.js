const { SlashCommandBuilder } = require('@discordjs/builders')
const sqldb = require('./../utils/sqlite');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('cinfo')
            .setDescription('Gets a proper card info about your favourite AniGame card')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Name of the card')
            ),
        async execute(interaction) {
            //TODO
        }
};
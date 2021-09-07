const { SlashCommandBuilder } = require('@discordjs/builders');



module.exports = {
    data: new SlashCommandBuilder()
            .setName('settings')
            .setDescription('Completes the default settings of the server')
            .addSubcommand( subcommand => 
                subcommand
                    .setName('guild')
                    .setDescription('Completes Guild Settings')
            )
            .addSubcommand(subcommand =>
                subcommand 
                    .setName('farming')
                    .setDescription('Completes Farming Settings')
            )
};
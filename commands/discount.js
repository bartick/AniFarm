const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('discount')
            .setDescription('Sets up discounts for you')
            .addSubcommand( subcommand => 
                subcommand.setName('role')
                .setDescription('Sets Up role type discounts')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('Choose the type')
                    .addChoice('add','add')
                    .addChoice('remove', 'remove')
                    .setRequired(true)
                )
                .addRoleOption(option => 
                    option.setName('name')
                    .setDescription('Select a role to add')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('discount')
                    .setDescription('Select a discount percentage')
                )
            )
            .addSubcommand( subcommand => 
                subcommand.setName('order')
                .setDescription('Sets up order type discounts')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('Choose the type')
                    .addChoice('add','add')
                    .addChoice('remove', 'remove')
                    .setRequired(true)
                )
                .addRoleOption(option => 
                    option.setName('number')
                    .setDescription('Select number of order to get discount')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('discount')
                    .setDescription('Select a discount percentage')
                )
            )
            .addSubcommand( subcommand => 
                subcommand.setName('daily')
                .setDescription('Sets up daily discounts')
                .addIntegerOption(option => 
                    option.setName('number')
                    .setDescription('Select number of orders to get discount')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('discount')
                    .setDescription('Select a discount percentage')
                    .setRequired(true)
                )
            ),
    async execute(interaction) {
        //TODO: show what the farmer is farming
    }
};
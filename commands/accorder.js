const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('accorder')
            .setDescription('Accept a order from a server')
            .addIntegerOption(option => 
                option.setName('orderid')
                .setDescription('Use the order id to accept the order')
            ),
    async execute(interaction) {
        //TODO: complete accept order
    }
};
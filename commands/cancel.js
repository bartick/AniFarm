const { SlashCommandBuilder } = require('@discordjs/builders');
// const orders = require('./../models/orders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('cancel')
            .setDescription('Cancel a order from a server')
            .addIntegerOption(option => 
                option.setName('orderid')
                .setDescription('Use the order id to cancel the order')
                .setRequired(true)
            ),
    async execute(interaction) {
        await interaction.reply("Not Yet Done");
        return;
        //TODO
    }
}
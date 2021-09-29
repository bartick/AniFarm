'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const conn = require('./../../utils/mongodb');
const orders = conn.models['orders'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete any order.')
        .addIntegerOption( option =>
            option.setName('orderid')
                .setDescription('Enter the order id')
                .setRequired(true)
        )
        .addStringOption( option => 
            option.setName('customerid')
                .setDescription('Enter the customerid')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });
        const orderId = interaction.options.getInteger('orderid');
        const customerId = interaction.options.getString('customerid');
        const order = await orders.deleteOne({
            orderid: orderId,
            customerid: customerId
        });
        if (order.deletedCount==0) {
            await interaction.editReply({
                content: `There is no order with id ${orderId}`
            });
        }
        else {
            await interaction.editReply({
                content: `Successfully deleted order with id ${orderId}`
            });
        }
    }
};
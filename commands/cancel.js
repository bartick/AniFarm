const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const orders = require('./../models/orders');

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
        if (interaction.guild===null) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setColor('RED')
                        .setTitle('⛔ Error')
                        .setDescription('You cannot use this command in DMs. Please go to a server to use this command.')
                ]
            });
            return;
        }
        await interaction.deferReply({
            ephemeral: true
        });
        const gameOrder = await orders.findOne({
            orderid: interaction.options.getInteger('orderid'),
            customerid: interaction.user.id
        });
        if (gameOrder===null) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setColor('RED')
                        .setTitle('⛔ Error')
                        .setDescription('Cannot find your order to cancel. Please check if the orderid you have provided is yours.')
                ]
            });
            return;
        }
        if (gameOrder.farmerid > 0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setColor('RED')
                        .setTitle('⛔ Error')
                        .setDescription('Your order is already been accepted by a farmer. Please ask the farmer to cancel the order. The farmer needs to complete the order in order to cancel.')
                ]
            });
            return;
        }
        const deleted = await orders.deleteOne({
            _id: gameOrder._id,
            farmerid: '0'
        });
        if(deleted.deletedCount==0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setColor('RED')
                        .setTitle('⛔ Error')
                        .setDescription('Your order is already been accepted by a farmer. Please ask the farmer to cancel the order. The farmer needs to complete the order in order to cancel.')
                ]
            });
            return;
        }
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTimestamp()
                    .setColor('GREEN')
                    .setTitle('🎉 Success')
                    .setDescription('Your order has been successfully deleted.\nSorry to see you go. If you want you can order again I would be glad to take it again.')
            ]
        });

        try {
            const pendingChannel = await interaction.client.channels.cache.get(gameOrder['pending']);
            const pendingMessage = await pendingChannel.messages.fetch(gameOrder.pendingid);
            await pendingMessage.delete()
        } catch (err) {
            // PASS
        }
    }
}
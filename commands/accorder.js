const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const orders = require('./../models/orders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('accorder')
            .setDescription('Accept a order from a server')
            .addIntegerOption(option => 
                option.setName('orderid')
                .setDescription('Use the order id to accept the order')
                .setRequired(true)
            ),
    async execute(interaction) {
        orderid = interaction.options.getInteger('orderid');
        const gameOrder = await orders.findOne({
            orderid: orderid,
            guildid: interaction.guild.id,
            farmerid: "0"
        })
        if (gameOrder===null) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('Cannot find the order.\nEither the order is accepted or there is no order with this id.')
                ]
            });
            return;
        }
        //Check if it is a farmer
        console.log(gameOrder);
        await interaction.reply({
            ephemeral: true,
            content: 'hello'
        })
    }
};
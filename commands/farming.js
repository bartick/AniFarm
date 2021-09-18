const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const orders = require('./../models/orders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('farming')
            .setDescription('Shows what you are farming'),
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
        const farming = await orders.findOne({
            farmerid: interaction.user.id
        })
        if (farming===null) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('⛔️ Error')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTimestamp()
                    .setColor('RED')
                    .setDescription(`**${interaction.user.tag}** you are current not farming. You need to start farming in order to use this command.\nThank You.`)
                ]
            });
            return;
        }
        let customer;
        try {
            customer = await interaction.client.users.fetch(farming.customerid);
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('⛔️ Error')
                    .setDescription(`I cannot find the user in the discord library or I am limited. If you think this is a mistake then here is the user id **${farming.customerid}** and you can report it to the support server.\nThank You.`)
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarUrl({dynamic: true, size: 1024}))
                    .setColor('RED')
                    .setThumbnail(interaction.client.user.displayAvatarUrl({dynamic: true, size: 1024}))
                ]
            });
            return;
        };
        let guild;
        try {
            guild = await interaction.client.guilds.cache.get(farming.guildid);
        } catch(err) {
            //SKIP
        }
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setColor('AQUA')
                .setThumbnail(farming.image)
                .setAuthor(customer.username, customer.displayAvatarURL({dynamic: true, size: 1024}))
                .setFooter(`${interaction.user.username} • Order Id ${gameOrder['orderid']}`, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp()
                .setTitle('Farming Status')
                .addField('Farmer:', interaction.user.tag, true)
                .addField('Customer:', customer.tag, true)
                .addField('Server:', guild===undefined?'No server found':guild.name, false)
                .addField('Order Summary:',"```\n◙ Card Name: "+farming.name+"\n◙ Loc-Floor: "+farming.location+"-"+farming.floor+"\n◙ Amount: "+farming.amount+"\n◙ Price: "+(farming.price - farming.price*(farming.discount/100))+"\n◙ Discount: "+farming.discount+'%\n◙ Amount Farmed:'+farming.amount_farmed+"/"+farming.amount+"\n```", false)
            ]
        })
    }
};
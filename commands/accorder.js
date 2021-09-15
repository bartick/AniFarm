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
        if (!(interaction.member.roles.cache.has(gameOrder.farmer))) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('You cannot accept orders from this server as you are not a farmer of this server.\nThank You...')
                ]
            });
            return;
        }
        const farming = await orders.findOne({
            farmerid: interaction.user.id
        });
        if(farming!==null) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('You are already farming. Please complete your current order before accepting another.\nThank You...')
                ]
            });
            return;
        }

        const customer = await client.users.cache.find(gameOrder.customerid);
        const embed = new MessageEmbed()
            .setColor('AQUA')
            .setThumbnail(gameOrder.image)
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
            .setFooter(undefined, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
            .setTimestamp()
            .setTitle('Order Status')
            .setDescription( "```\n◙ Card Name: "+gameOrder.name+"\n◙ Loc-Floor: "+gameOrder.location+"-"+gameOrder.floor+"\n◙ Amount: "+gameOrder.amount+"\n◙ Price: "+(gameOrder.price - gameOrder.price*(gameOrder.discount/100))+"\n◙ Discount: "+gameOrder.discount+"%\n```")
        
        try {
            const statusChannel = await interaction.client.channels.cache.get(gameOrder['pending']);
            await statusChannel.send({
                embeds: [embed]
            });
        } catch(err) {
            await interaction.send({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription(`An error occured. Make sure I have permission to send message or see the channel <#${setOrder['pending']}>\n\n**Error:**\n${err.message}`)
                ]
            });
        }

        
        await interaction.reply({
            ephemeral: true,
            content: 'hello'
        })
    }
};
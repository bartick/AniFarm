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
        await interaction.deferReply({
            ephemeral: true
        });
        const orderid = interaction.options.getInteger('orderid');
        const gameOrder = await orders.findOne({
            orderid: orderid,
            guildid: interaction.guild.id,
            farmerid: "0"
        })
        if (gameOrder===null) {
            await interaction.editReply({
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
            await interaction.editReply({
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
            await interaction.editReply({
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

        let customer;
        try {
            customer = await interaction.client.users.fetch(gameOrder.customerid);
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('⛔️ Error')
                    .setDescription(`I cannot find the user in the discord library or I am limited. If you think this is a mistake then here is the user id **${gameOrder.customerid}** and you can report it to the support server.\nThank You.`)
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarUrl({dynamic: true, size: 1024}))
                    .setColor('RED')
                    .setThumbnail(interaction.client.user.displayAvatarUrl({dynamic: true, size: 1024}))
                ]
            });
            return;
        };
        
        const embed = new MessageEmbed()
            .setColor('AQUA')
            .setThumbnail(gameOrder.image)
            .setAuthor(customer.username, customer.displayAvatarURL({dynamic: true, size: 1024}))
            .setFooter(`${interaction.user.username} • Order Id ${gameOrder['orderid']}`, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
            .setTimestamp()
            .setTitle('Farming Status')
            .addField('Farmer:', interaction.user.tag, true)
            .addField('Customer:', customer.tag, false)
            .addField('Order Summary:',"```\n◙ Card Name: "+gameOrder.name+"\n◙ Loc-Floor: "+gameOrder.location+"-"+gameOrder.floor+"\n◙ Amount: "+gameOrder.amount+"\n◙ Price: "+(gameOrder.price - gameOrder.price*(gameOrder.discount/100))+"\n◙ Discount: "+gameOrder.discount+'%\n◙ Amount Farmed:'+gameOrder.amount_farmed+"/"+gameOrder.amount+"\n```", false)
        
        let status = "0";
        try {
            const statusChannel = await interaction.client.channels.cache.get(gameOrder['status']);
            status = await statusChannel.send({
                embeds: [embed]
            });
        } catch(err) {
            await interaction.editReply({
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

        try {
            const pendingChannel = await interaction.client.channels.cache.get(gameOrder['pending']);
            const pendingMessage = await pendingChannel.messages.fetch(gameOrder.pendingid);
            await pendingMessage.delete()
        } catch (err) {
            // PASS
        }
        const test = await orders.updateOne(
            {
                _id: gameOrder._id,
                farmerid: "0"
            },
            {
                $set: {
                    farmerid: interaction.user.id,
                    pendingid: "0",
                    statusid: status==="0" ? "0": status.id,
                }
            }
        )
        if (test.matchedCount===0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setColor('RED')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTimestamp()
                    .setTitle('⛔️ Error')
                    .setDescription(`This order has already been accepted by another user. Please find a new order to accept.`)
                ]
            })
            return;
        }
        await interaction.editReply({
            ephemeral: true,
            embeds: [embed]
        })
        try {
            await customer.send({
                content: status==="0"? `Order accepted by **${interaction.user.tag}**`: `Order accepted by **${interaction.user.tag}**. Jump to the order\n${status.url}`,
                embeds: [embed]
            })
        } catch (err) {
            //PASS
        };
    }
};
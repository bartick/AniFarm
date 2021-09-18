const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const orders = require('./../models/orders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('updatevalue')
            .setDescription('Update the amount of cards you have farmed')
            .addIntegerOption(option => 
                option.setName('value')
                .setDescription('Add the new value')
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
        const value = interaction.options.getInteger('value')
        const gameOrder = await orders.findOne({
            farmerid: interaction.user.id
        });

        if (gameOrder===null) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTitle('⛔️ Error')
                        .setDescription('You are not farming in any server. You need to pick up a order in order to use the command.')
                        .setTimestamp()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                ]
            });
            return;
        }
        await interaction.deferReply({ephemeral: true});
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
            .addField('Order Summary:',"```\n◙ Card Name: "+gameOrder.name+"\n◙ Loc-Floor: "+gameOrder.location+"-"+gameOrder.floor+"\n◙ Amount: "+gameOrder.amount+"\n◙ Price: "+(gameOrder.price - gameOrder.price*(gameOrder.discount/100))+"\n◙ Discount: "+gameOrder.discount+'%\n◙ Amount Farmed:'+value+"/"+gameOrder.amount+"\n```", false)
        

        if (value>=gameOrder.amount) {
            await orders.deleteOne({
                _id: gameOrder._id
            });
            try {
                await customer.send({
                    content: `Your order has been completed by ${interaction.user.tag} (**ID**: ${interaction.user.id}). \nPlease contact the user to setup a trade...`,
                    embeds: [embed]
                });
            } catch (err) {
                //SKIP
            }
            try {
                const statusChannel = await interaction.client.channels.cache.get(gameOrder.status);
                const statusOrder = await statusChannel.messages.fetch(gameOrder.statusid);
                await statusOrder.delete()
            } catch (err) {
                //SKIP
            }
            try {
                const statusChannel = await interaction.client.channels.cache.get(gameOrder['complete']);
                await statusChannel.send({
                    embeds: [embed]
                });
            } catch(err) {
                //SKIP
            }
            const copyButton = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('copy')
                        .setLabel('DM A COPY')
                        .setStyle('PRIMARY')
                )
            const storeCopy = await interaction.editReply({
                content: `You have completed order for ${customer.tag} (**ID**: ${customer.id}). \nPlease contact the user to setup a trade... `,
                embeds: [embed],
                components: [
                    copyButton
                ],
                fetchReply: true
            });

            const filter = (inter) => {
                if ((interaction.user.id === inter.user.id) && inter.customId==='copy') return true;
                return inter.reply({
                    content: "You cannot use this button",
                    ephemeral: true
                })
            };
            const collector = await storeCopy.createMessageComponentCollector({ filter, time: 30000, max: 1 });
            collector.on('collect', async inter => {
                copyButton.components[0].setDisabled(true);
                
                try {
                    await inter.user.send({
                        content: `You have completed order for ${customer.tag} (**ID**: ${customer.id}). \nPlease contact the user to setup a trade... `,
                        embeds: [embed]
                    })
                    copyButton.components[0].setLabel('DM SENT!');
                } catch (err) {
                    copyButton.components[0].setLabel('DM CLOSED!');
                }
                await inter.update({
                    content: `You have completed order for ${customer.tag} (**ID**: ${customer.id}). \nPlease contact the user to setup a trade... `,
                    embeds: [embed],
                    components: [
                        copyButton
                    ]
                });
            })

        }
        else {
            let toUpdate = {
                amount_farmed: value
            };

            try {
                const statusChannel = await interaction.client.channels.cache.get(gameOrder.status);
                try {
                    const statusOrder = await statusChannel.messages.fetch(gameOrder.statusid);
                    try {
                        await statusOrder.edit({
                            embeds: [embed]
                        });
                    } catch (e) {
                        //SKIP
                    }
                } catch (err) {
                    try {
                        const statusMessage = await statusChannel.send({
                            embeds: [embed]
                        });

                        toUpdate['statusid'] = statusMessage.id;
                    } catch (e) {
                        //SKIP
                    }
                }
            } catch(error) {
                //SKIP
            }

            await orders.updateOne({
                _id: gameOrder._id
            }, {
                $set: {
                    amount_farmed: value
                }
            });

            await interaction.editReply({
                content: '✅ Successfully Updated.'
            })
        }
    }
};
import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { Command, CustomCommandInteraction } from "../interfaces";
import { OrdersType } from "../schema";
import { mongodb } from "../utils";

const Orders = mongodb.models['orders'];

const cancel: Command = {
    data: new SlashCommandBuilder()
        .setName('cancel')
        .setDescription('Cancel your current order.')
        .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('orderid')
                    .setDescription('The order ID to cancel.')
                    .setRequired(true)
                ),
    execute: async (interaction: CustomCommandInteraction) => {
        await interaction.deferReply({
            ephemeral: true,
        });
        const orderid: Number = interaction.options.get('orderid', true).value as Number;

        const order: OrdersType | null = await Orders.findOne({
            orderid: orderid,
            customerid: interaction.user.id,
        });

        if (!order) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('You do not have an order with that ID.')
                        .setTimestamp()
                        .setThumbnail(interaction.client.user?.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }) || '')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            }),
                        }),
                ],
            });
            return;
        }

        if(order.farmerid !== "0") {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('You cannot cancel an order that is in progress.')
                        .setTimestamp()
                        .setThumbnail(interaction.client.user?.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }) || '')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            }),
                        }),
                ],
            });
            return;
        }

        const deleted = await Orders.deleteOne({
            orderid: orderid,
            customerid: interaction.user.id,
            farmerid: "0"
        });

        if(deleted.deletedCount===0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('Your order has been accepted by a farmer. You cannot cancel it now.')
                        .setTimestamp()
                        .setThumbnail(interaction.client.user?.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }) || '')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            }),
                        }),
                ]
            });
            return;
        }

        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle('Order Cancelled')
                    .setDescription(`Order ${orderid} has been cancelled.`)
                    .setColor('#00ff00')
                    .setThumbnail(interaction.client.user?.displayAvatarURL({
                        dynamic: true,
                        size: 1024
                    }) || '')
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024
                        })
                    })
                    .setTimestamp()
            ]
        });

        try {
            const pendingChannel = interaction.client.channels.cache.get(order['pending']) as TextChannel | NewsChannel | undefined;
            const pendingMessage = await pendingChannel?.messages.fetch(order.pendingid);
            await pendingMessage?.delete()
        } catch (err) {
            // PASS
        }
    }
}

export default cancel;    
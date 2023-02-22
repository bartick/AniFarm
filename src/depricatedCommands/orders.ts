import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Message } from "discord.js";
import { Command, CustomCommandInteraction } from "../interfaces";
import { OrdersType } from "../schema";

import { mongodb, paginate } from "../utils";

const Orders = mongodb.models['orders'];

const orders: Command = {
    data: new SlashCommandBuilder()
        .setName("orders")
        .setDescription("Shows all of your orders"),
    execute: async (interaction: CustomCommandInteraction) => {
        const messageReply = await interaction.deferReply({
            fetchReply: true
        }) as Message<boolean>

        const ordersList: Array<OrdersType> = await Orders.find({
            customerid: interaction.user.id,
        });

        // if the user is not farming anything, tell them so.
        if (ordersList.length === 0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('You have no orders queued.')
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

        const embeds: Array<MessageEmbed> = [];
        for (const order of ordersList) {
            const guild = interaction.client.guilds.cache.get(order.guildid);
            const farmer = await interaction.client.users.fetch(order.farmerid).catch(() => null);
            embeds.push(
                new MessageEmbed()
                    .setColor('#00ffff')
                    .setTitle('Order Status')
                    .setFields([
                        {
                            name: 'Farmer:',
                            value: (farmer?.username || 'Unknown') + '#' + (farmer?.discriminator || '0000'),
                            inline: true,
                        },
                        {
                            name: 'Customer:',
                            value: interaction.user.username + '#' + interaction.user.discriminator,
                            inline: true, 
                        },
                        {
                            name: 'Guild:',
                            value: guild?.name || 'Unknown',
                            inline: false
                        },
                        {
                            name: 'Order Summary:',
                            value: `${"```"}\n◙ Card Name: ${order.name}\n◙ Loc-Floor: ${order.location}-${order.floor}\n◙ Amount: ${order.amount}\n◙ Price: ${order.price - Math.trunc(order.price*order.discount/100)}\n◙ Discount: ${order.discount} \n${"```"}`,
                            inline: false,
                        }
                    ])
                    .setThumbnail(order.image)
                    .setTimestamp()
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }),
                    })
                    .setFooter({
                        text: `${farmer?.username || 'Unknown'} • Order Id ${order.orderid}`,
                        iconURL: farmer?.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        })|| ''
                    })
            );
        }


        await paginate(interaction, embeds, messageReply);
    }
}

export default orders;
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Message } from "discord.js";
import { Command, CustomCommandInteraction } from "../interfaces";
import { OrdersType } from "../schema";

import { mongodb, paginate } from "../utils";

const Orders = mongodb.models['orders'];
 
const farming: Command = {
    data: new SlashCommandBuilder()
        .setName("farming")
        .setDescription("Shows what you are farming currently"),
    execute: async (interaction: CustomCommandInteraction) => {
        const messageReply = await interaction.deferReply({
            fetchReply: true
        }) as Message<boolean>;
        const farmingList: Array<OrdersType> = await Orders.find({
            farmerid: interaction.user.id,
        });

        // if the user is not farming anything, tell them so.
        if (farmingList.length === 0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('You are not farming anything.')
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
        for (const order of farmingList) {
            const customer = await interaction.client.users.fetch(order.customerid).catch(() => {});
            const guild = interaction.client.guilds.cache.get(order.guildid);
            embeds.push(
                new MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Farming Status')
                    .setFields([
                        {
                            name: 'Farmer:',
                            value: interaction.user.username,
                            inline: true,
                        },
                        {
                            name: 'Customer:',
                            value: customer?.username || 'Unknown',
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
                        name: customer?.username || 'Unknown',
                        iconURL: customer?.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }) || '',
                    })
                    .setFooter({
                        text: `${interaction.user.username} • Order Id ${order.orderid}`,
                        iconURL: interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        })
                    })
            )
        }

        await paginate(interaction, embeds, messageReply);
    }
}


export default farming;
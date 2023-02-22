import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { Command, CustomCommandInteraction } from "../interfaces";
import { OrdersType } from "../schema";

import { mongodb } from "../utils";

const Orders = mongodb.models['orders'];
 
const farming: Command = {
    data: new SlashCommandBuilder()
        .setName("farming")
        .setDescription("Shows what you are farming currently"),
    execute: async (interaction: CustomCommandInteraction) => {
        await interaction.deferReply({
            ephemeral: true,
        });
        const farmingList: OrdersType | null = await Orders.findOne({
            farmerid: interaction.user.id,
        });

        // if the user is not farming anything, tell them so.
        if (farmingList === null) {
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

        const customer = await interaction.client.users.fetch(farmingList.customerid).catch(() => {});
        const guild = interaction.client.guilds.cache.get(farmingList.guildid);
        const embed = new MessageEmbed()
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
                        value: `${"```"}\n◙ Card Name: ${farmingList.name}\n◙ Loc-Floor: ${farmingList.location}-${farmingList.floor}\n◙ Amount: ${farmingList.amount}\n◙ Price: ${farmingList.price - Math.trunc(farmingList.price*farmingList.discount/100)}\n◙ Discount: ${farmingList.discount} \n${"```"}`,
                        inline: false,
                    }
                ])
                .setThumbnail(farmingList.image)
                .setTimestamp()
                .setAuthor({
                    name: customer?.username || 'Unknown',
                    iconURL: customer?.displayAvatarURL({
                        dynamic: true,
                        size: 1024,
                    }) || '',
                })
                .setFooter({
                    text: `${interaction.user.username} • Order Id ${farmingList.orderid}`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                        size: 1024,
                    })
                })
        await interaction.editReply({
            embeds: [embed],
        })
    }
}


export default farming;
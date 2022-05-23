import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { GuildMember, Message, MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { Command, CustomCommandInteraction } from "../interfaces";
import { OrdersType } from "../schema";
import { mongodb } from "../utils";

const Orders = mongodb.models['orders'];

const accorder: Command = {
    data: new SlashCommandBuilder()
        .setName('accorder')
        .setDescription('Accept a order from the server')
        .addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName('orderid')
            .setDescription('Use the order id to accept the order')
            .setRequired(true)
        ),
    rateLimitName: 'ACCEPT_ORDER',
    execute: async(interaction: CustomCommandInteraction) => {
        await interaction.deferReply({
            ephemeral: true
        });
        const rateLimit: Array<String> = interaction.client.rateLimit?.get('ACCEPT_ORDER') as Array<String>;
        const orderid: Number = interaction.options.get('orderid', true).value as Number;
        if (rateLimit.indexOf(orderid.toString())>=0) {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Rate Limited')
                        .setDescription('Somone already trying to accept this order. Please wait for them to finish.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                ]
            });
            return;
        }
        interaction.client.rateLimit?.set('ACCEPT_ORDER', [...rateLimit, orderid.toString()]);
        
        const order: OrdersType | null = await Orders.findOne({
            orderid: orderid,
        })

        if (!order) {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('This order is no longer available.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')
                ]
            });
            return;
        }
        if (order.farmerid!='0') {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('This order is already claimed by someone else.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')
                ]
            });
            return;
        }
        const buttonRateLimit: Array<String> = interaction.client.rateLimit?.get('ORDER_PICKUP') as Array<String>;
        if (buttonRateLimit.indexOf(`${order.pendingid}`)>=0) {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Rate Limited')
                        .setDescription('Somone already trying to accept this order. Please wait for them to finish.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                ]
            });
            return;
        }

        const statusChannel: TextChannel | NewsChannel | undefined = interaction.guild?.channels.cache.get(order.status) as TextChannel | NewsChannel | undefined;
        if (!statusChannel) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('The status channel for this order is no longer available. Please contact the server owner to fix it.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')
                ]
            });
            return;
        };

        const customer: GuildMember | undefined = await interaction.guild?.members.fetch(order.customerid);
        if (!customer) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('The customer for this order is no longer available. Please contact the server owner to fix it. If you think this is a mistake please contact the developer.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')
                ]
            });
            return;
        }

        const acceptedOrder: MessageEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setAuthor({
                name: customer.user.username,
                iconURL: customer.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                })
            })
            .setThumbnail(order.image)
            .setTitle("Farming Status")
            .setTimestamp()
            .addField('Farmer:', `${interaction.user.username}#${interaction.user.discriminator}`, true)
            .addField('Customer:', `${customer.user.username}#${customer.user.discriminator}`,true)
            .addField(
                `Order Summary: `,
                `${"```"}\n◙ Card Name: ${order.name}\n◙ Loc-Floor: ${order.location}-${order.floor}\n◙ Amount: ${order.amount}\n◙ Price: ${order.price - Math.trunc(order.price*order.discount/100)}\n◙ Discount: ${order.discount} \n${"```"}`
            )
            .setFooter({
                text: `${interaction.user.username} • Order Id ${order.orderid}`,
                iconURL: interaction.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                })
            })

        let statusMessage: Message<boolean>;
        try {
            statusMessage = await statusChannel.send({
                embeds: [
                    acceptedOrder
                ],
            });
        } catch(_: any) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('The status channel for this order is no longer available. Please contact the server owner to fix it.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')
                ]
            });
            return;
        }

        await Orders.updateOne({
            _id: order._id,
        }, {
            $set: {
                pendingid: '',
                farmerid: interaction.user.id,
                statusid: statusMessage.id
            }
        });

        try {
            const pendingMessage: Message<boolean> | undefined = await (interaction.client.channels.cache.get(order.pending) as TextChannel | NewsChannel | undefined)?.messages.fetch(order.pendingid);
            await (pendingMessage as Message<boolean>).delete();
        } catch(_) {
            // do nothing
        }

        acceptedOrder.setTitle('Order Accepted !!!');

        await interaction.followUp({
            embeds: [
                acceptedOrder
            ],
            ephemeral: true
        });

        await customer.send({
            embeds: [
                acceptedOrder
            ]
        });
    }
}

export default accorder;
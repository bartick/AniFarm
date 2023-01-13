import { GuildMember, GuildMemberRoleManager, Message, MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { ButtonCommand, CustomButtonInteraction } from "../interfaces";
import { mongodb, noOrderForFarmer } from "../utils";
import { OrdersType } from "../schema";

const Orders = mongodb.models['orders'];

const acceptOrder: ButtonCommand = {
    name: 'ORDER_PICKUP',
    execute: async(interaction: CustomButtonInteraction) => {
        await interaction.deferUpdate();
        if(await noOrderForFarmer(interaction.user.id)) {
            await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('You are already farming. Please use this command if you are not farming and want to accpet a new order.')
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
                ephemeral: true,
            });
            return;
        }


        const order: OrdersType | null = await Orders.findOne({
            pending: interaction.channelId,
            pendingid: interaction.message.id,
            guildid: interaction.guildId,
        });
        if (!order) {
            await interaction.followUp({
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
                ],
                ephemeral: true
            });
            return;
        }

        if ((interaction.member?.roles as GuildMemberRoleManager).cache.has(order.farmer)) {
            interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Error')
                        .setDescription('You are not a farmer in this server. Thus you do not qualify to accept this order.')
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

        if (order.farmerid!=="0") {
            interaction.followUp({
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

        const rateLimit = interaction.client.rateLimit?.get('ACCEPT_ORDER') as Array<String>;
        if (rateLimit.indexOf(`${order.orderid}`)>=0) {
            await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Rate Limited')
                        .setDescription('Someone already trying to accept this order. Please wait for them to finish.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')

                ],
                ephemeral: true
            });
            return;
        }
        const statusChannel: TextChannel | NewsChannel | undefined = interaction.guild?.channels.cache.get(order.status) as TextChannel | NewsChannel | undefined;
        if (!statusChannel) {
            await interaction.followUp({
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
                ],
                ephemeral: true
            });
            return;
        };
        const customer: GuildMember | undefined = await interaction.guild?.members.fetch(order.customerid);
        if (!customer) {
            await interaction.followUp({
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
                ],
                ephemeral: true
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
            await interaction.followUp({
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
                ],
                ephemeral: true
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
            await (interaction.message as Message<boolean>).delete();
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

export default acceptOrder;
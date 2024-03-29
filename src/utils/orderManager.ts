import { 
    ButtonInteraction, 
    GuildMemberRoleManager, 
    Message, 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    NewsChannel, 
    TextChannel, 
    User,
    ButtonStyle,
    ComponentType,
} from 'discord.js';
import { 
    CustomButtonInteraction,
    CustomCommandInteraction 
} from '../interfaces';
import { 
    OrdersType,
    SettingsType 
} from "../schema";
import {
    SoulEnums,
    mongodb,
    profiledb
} from './'

const Orders = mongodb.models['orders'];
const Profile = profiledb.model('anifarm');

class OrderManager {

    private order: OrdersType | null;
    private interaction: CustomCommandInteraction | CustomButtonInteraction;
    private customer: User | null;
    private farmer: User | null;

    constructor(interaction: CustomCommandInteraction | CustomButtonInteraction) {
        this.interaction = interaction;
        this.order = null;
        this.customer = null;
        this.farmer = null;
    }

    setCustomer(user: User) {
        this.customer = user;
    }

    setFarmer(user: User) {
        this.farmer = user;
    }

    public errorEmbed(message: string): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⛔️ Error')
            .setAuthor({
                name: this.interaction.user.username,
                iconURL: this.interaction.user.displayAvatarURL({ size: 1024 })
            })
            .setDescription(message)
            .setTimestamp()
            .setThumbnail(this.interaction.client.user?.displayAvatarURL({ size: 1024 }) || '')

        return embed;
    }

    private orderAcceptButton(): ActionRowBuilder<ButtonBuilder> {
        const button: ActionRowBuilder<ButtonBuilder> = 
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('ORDER_PICKUP')
                                    .setDisabled(false)
                                    .setEmoji('✅')
                                    .setLabel('Accept this order')
                                    .setStyle(ButtonStyle.Success)
                            )
        
        return button;
    }

    public async getOrder(orderId: number): Promise<boolean> {
        if (this.order) return true;
        this.order = await Orders.findOne({
            orderid: orderId
        });
        return this.order ? true : false;
    }

    public async getOrderByPeningId(pendingId: string): Promise<boolean> {
        if (this.order) return true;
        this.order = await Orders.findOne({
            pendingid: pendingId
        });
        return this.order ? true : false;
    }

    public async getOrderByFarmer(): Promise<boolean> {
        if (this.order) return true;
        this.order = await Orders.findOne({
            farmerid: this.interaction.user.id
        });
        return this.order ? true : false;
    }

    public async getOrderByCustomer(): Promise<OrdersType[]> {
        return await Orders.find({
            customerid: this.interaction.user.id
        });
    }

    public async checkOrderPlacedEmbeds(): Promise<EmbedBuilder[]> {
        const orders = await this.getOrderByCustomer();
        const embeds: EmbedBuilder[] = [];
        for (const order of orders) {
            this.order = order;
            const embed = await this.completedOrderEmbed();
            embeds.push(embed);
        }

        return embeds;
    }

    private createOrderId(): number {
        return Math.trunc(Date.now() + Math.random())%100000000;
    }

    private calculateDiscount(settings: SettingsType): number {
        let discount = 0;
        for (const dis of settings.disRole) {
            if ((this.interaction.member?.roles as GuildMemberRoleManager).cache.has(dis[0]) && discount<dis[1]) {
                discount = dis[1];
            }
        }

        if (Date.now() <= (settings.disServer.get('next') as number)) discount += (settings.disServer.get('discount') as number);

        return discount;
    }

    private calculatePrice(orderPrice: {
        price: number,
        amount: number,
        discount: number
    }): number {
        const priceBeforeDiscount = orderPrice.price * orderPrice.amount;
        const discount = orderPrice.discount;

        return priceBeforeDiscount - (priceBeforeDiscount * (discount / 100));
    }

    private async getCustomer(): Promise<void>{
        if (!this.order) return;
        this.customer = this.interaction.client.users.cache.get(this.order.customerid) || await this.interaction.client.users.fetch(this.order.customerid).then((value: User) => value).catch(() => null);
    }

    private async getFarmer(): Promise<void> {
        if (!this.order) return;
        try {
            this.farmer = await this.interaction.client.users.fetch(this.order.farmerid).then((value: User) => value).catch(() => null);
        } catch (_) {}
    }

    public async completedOrderEmbed(): Promise<EmbedBuilder> {
        if (!this.order) return this.errorEmbed('Order was not created properly. Please create a new order')

        await this.getFarmer();

        const embed = await this.createOrderEmbed(this.order);
        embed.setTitle('Farming Status 🌾')
        embed.setFields(
            {
                name: 'Farmer:',
                value: this.farmer?.username || 'No Farmer',
                inline: true
            },
            {
                name: 'Customer:',
                value: this.customer?.username || 'Error',
                inline: true
            },
            {
                name: 'Order Summary: ' + this.order.soulEmoji,
                value: '```js\n' +
                `◙ Order ID: ${this.order.orderid}\n` +
                `◙ Soul: ${this.order.soulName}\n` +
                `◙ Amount: ${this.order.amount}\n` +
                `◙ Price: ${this.calculatePrice(this.order)}\n` +
                `◙ Discount: ${this.order.discount}%\n` +
                `◙ Amount Farmed: ${this.order.amount_farmed}/${this.order.amount}\n` +
                '```',
                inline: false
            }
        )
        embed.setFooter({
            text: this.farmer?.username || 'No Farmer',
            iconURL: this.farmer?.displayAvatarURL({ size: 1024 }) || undefined
        })

        return embed;

    }

    public async createOrderEmbed(orderChecker: {
        orderid: number,
        soulName: string,
        price: number
        amount: number,
        discount: number
        soulEmoji: string
    }): Promise<EmbedBuilder> {

        if (this.customer==null) await this.getCustomer();
        
        const embed = new EmbedBuilder()
                    .addFields(
                        {
                            name: 'Order Summery: ' + orderChecker.soulEmoji,
                            value: '```js\n' +
                            `◙ Order ID: ${orderChecker.orderid}\n` +
                            `◙ Soul: ${orderChecker.soulName}\n` +
                            `◙ Amount: ${orderChecker.amount}\n` +
                            `◙ Price: ${this.calculatePrice(orderChecker)}\n` +
                            `◙ Discount: ${orderChecker.discount}%\n` +
                            '```',
                            inline: false
                        },
                    )
                    .setAuthor({
                        name: this.customer?.username || '',
                        iconURL: this.customer?.displayAvatarURL() || ''
                    })
                    .setThumbnail(this.interaction.client.user?.displayAvatarURL() || '')
                    .setColor('#00FFFF')
                    .setTimestamp();

        return embed;
    }

    private async delay(ms: number): Promise<void> {
        await new Promise(res => setTimeout(res, ms))
    }

    public async createOrder(soul: keyof typeof SoulEnums , amount: number, settings: SettingsType, customerId: string): Promise<void> {

        const tempOrder = {
            orderid: this.createOrderId(),
            guildid: `${settings._id}`,
            farmer: settings.farmer,
            farmerid: '0',
            customerid: customerId,
            pending: settings.pending,
            pendingid: '0',
            status: settings.status,
            statusid: '0',
            complete: settings.complete,
            amount: amount,
            price: settings.soul,
            discount: this.calculateDiscount(settings),
            amount_farmed: 0,
            soulName: soul,
            soulEmoji: SoulEnums[soul]
        }

        const embed = await this.createOrderEmbed(tempOrder);

        await this.interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Confirm")
                            .setEmoji('✅')
                            .setStyle(ButtonStyle.Success)
                            .setCustomId('confirm'),
                        new ButtonBuilder()
                            .setLabel("Cancel")
                            .setEmoji('❌')
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId('cancel')
                    )
            ]
        });

        const message = await this.interaction.fetchReply() as Message<boolean>;

        const filter = (interaction: ButtonInteraction) => {
            return (interaction.customId === 'confirm' || interaction.customId === 'cancel') && interaction.user.id === this.interaction.user.id;
        }

        const collector = message.createMessageComponentCollector({ filter, time: 30000, componentType: ComponentType.Button, max: 1 });

        collector.on('collect', async (confirmInteraction: ButtonInteraction) => {
            switch (confirmInteraction.customId) {
                case 'confirm': {
                    this.order = await new Orders(tempOrder).save();

                    embed.setTitle('Order Confirmed');
                    embed.setColor('#00FF00');
                    embed.setDescription('Your order has been confirmed successfully.');
                    await message.edit({
                        embeds: [embed],
                        components: []
                    })

                    await this.delay(5000);

                    try {
                        await message.delete();
                    } catch (_) {}

                    embed.setColor("#00FFFF");
                    embed.setTitle('Pickup the order');
                    embed.setDescription(`If you are the farmer please pick up the order`);

                    const pending = await this.interaction.client.channels.fetch(tempOrder.pending) as TextChannel | NewsChannel;
                    if (pending===null || !(pending instanceof TextChannel || pending instanceof NewsChannel)) {
                        this.interaction.followUp({
                            embeds: [
                                this.errorEmbed("Please ask the server admin to complete the settings before you can use this command here.")
                            ],
                            ephemeral: true
                        })
                        return;
                    }
                    await this.sendMessages(pending, settings.vacant==='0'?undefined:`<@&${settings.vacant}> a new order has arrived.`, 'pendingid');

                    break;
                }
                case 'cancel': {
                    embed.setTitle('Order Cancelled');
                    embed.setDescription('Your order has been cancelled successfully.');
                    embed.setColor('#ff0000')
                    await message.edit({
                        embeds: [embed],
                        components: []
                    })

                    await this.delay(2000);

                    try {
                        await message.delete();
                    } catch (_) {}
                }
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size > 0) return;
            embed.setTitle('Order Expired');
            embed.setDescription('Your order has expired, please try again.');
            embed.setColor('#ff0000')
            await message.edit({
                embeds: [embed],
                components: []
            })

            await this.delay(2000);

            try {
                await message.delete();
            } catch (_) {}
        });
    }

    public async sendMessages(channel: TextChannel | NewsChannel, content: string | undefined = undefined, orderUpdater: keyof OrdersType | null = null): Promise<void> {
        if (!this.order) {
            this.interaction.followUp({
                embeds: [
                    this.errorEmbed('Please create an order first.')
                ],
                ephemeral: true
            })
            return;
        };
        if (channel.permissionsFor(this.interaction.client.user!)?.has('SendMessages') === false) {
            this.interaction.followUp({
                embeds: [
                    this.errorEmbed('I do not have permission to send messages in this channel.')
                ],
                ephemeral: true
            })
        };

        const embed = await this.completedOrderEmbed();
        const components: ActionRowBuilder<ButtonBuilder>[] = [];
        if (orderUpdater==="pendingid") {
            components.push(
                this.orderAcceptButton()
            )
        }

        const message = await channel.send({
            content: content,
            embeds: [embed],
            components: components
        }).then(msg => msg);

        if(orderUpdater) {
            await Orders.updateOne({
                orderid: this.order.orderid
            }, {
                $set: {
                    [orderUpdater]: message.id
                }
            });
        }

    }

    private async sendDMMessage(content: string | undefined = undefined , embed: EmbedBuilder, user: User): Promise<void> {
        if (!user) return;

        await user.send({
            content: content,
            embeds: [embed]
        }).catch(() => null);
    }

    private async notifyCustomer(content: string | undefined = undefined, embed: EmbedBuilder): Promise<User | null> {
        if (!this.order) return null;

        const customer = await this.interaction.client.users.fetch(this.order.customerid);

        await this.sendDMMessage(content, embed, customer);

        return customer;
    }

    // private async notifyFarmer(embed: MessageEmbed): Promise<void> {
    //     if (!this.order) return;

    //     await this.sendDMMessage(embed, this.order.farmerid);
    // }

    public async acceptOrder(): Promise<boolean> {
        let accepted = false;

        if(!this.order) return accepted;

        // const buttonRateLimit: Array<String> = this.interaction.client.rateLimit?.get('ORDER_PICKUP') as Array<String>;
        // if (buttonRateLimit.indexOf(`${this.order.pendingid}`)>=0) {
        //     this.interaction.editReply({
        //         embeds: [
        //             new MessageEmbed()
        //                 .setColor('#ff0000')
        //                 .setTitle('⛔️ Rate Limited')
        //                 .setDescription('Somone already trying to accept this order. Please wait for them to finish.')
        //                 .setTimestamp()
        //                 .setAuthor({
        //                     name: this.interaction.user.username,
        //                     iconURL: this.interaction.user.displayAvatarURL({
        //                         dynamic: true,
        //                         size: 1024,
        //                     })
        //                 })
        //         ]
        //     });
        //     return accepted;
        // }

        if (!(this.interaction.member?.roles as GuildMemberRoleManager).cache.has(this.order.farmer)) {
            this.interaction.editReply({
                embeds: [
                    this.errorEmbed('You do not have the required role to accept this order. You need to have the farmer role.')
                ]
            })
            return accepted;
        }

        if(this.order.farmerid!=='0') {
            this.interaction.editReply({
                embeds: [
                    this.errorEmbed('This order has already been accepted.')
                ]
            })
            return accepted;
        }

        const checkForFarmer = await Orders.findOne({
            farmerid: this.interaction.user.id
        });
        if(checkForFarmer) {
            this.interaction.editReply({
                embeds: [
                    this.errorEmbed('You already have an order in progress.')
                ]
            });
            return accepted;
        };

        this.order.farmerid = this.interaction.user.id;

        const embed = await this.completedOrderEmbed();

        const statusChannel = await this.interaction.client.channels.fetch(this.order.status) as TextChannel | NewsChannel;

        if (statusChannel.permissionsFor(this.interaction.client.user!)?.has('SendMessages') === false && statusChannel!==null) {
            this.interaction.followUp({
                embeds: [
                    this.errorEmbed('I do not have permission to send messages in this channel.')
                ],
                ephemeral: true
            })
        };

        const message = await statusChannel.send({
            embeds: [embed]
        }) as Message<boolean>;

        try {
            const pendingMessage = await (this.interaction.client.channels.cache.get(this.order.pending) as TextChannel | NewsChannel).messages.fetch(this.order.pendingid);
            await pendingMessage.delete();
        } catch (_) {}

        this.order.pendingid = '0';
        this.order.statusid = message.id;

        await Orders.updateOne({
            orderid: this.order.orderid
        }, {
            $set: {
                farmerid: this.order.farmerid,
                pendingid: this.order.pendingid,
                statusid: this.order.statusid
            }
        });

        accepted = true;

        embed.setTitle('✅ Order Accepted!!!');

        await this.notifyCustomer(undefined, embed);

        return accepted;
    }

    public async completeOrder(): Promise<boolean> {
        if (!this.order) return false;

        this.order.amount_farmed = this.order.amount;

        const embed = await this.completedOrderEmbed();
        embed.setTitle('✅ Order Completed!!!');

        await Orders.deleteOne({
            orderid: this.order.orderid
        })

        
        try {
            const statusMessage = await (this.interaction.client.channels.cache.get(this.order.status) as TextChannel | NewsChannel).messages.fetch(this.order.statusid);
            await statusMessage.delete();
        } catch(_) {}

        const customer = await this.notifyCustomer(`Please collect your order from ${this.interaction.user.username}(**ID:** ${this.interaction.user.id})`, embed);

        if(customer) {
            await this.sendDMMessage(`You have completed your order. Trade with ${customer.username}(**ID:** ${customer.id})`, embed, this.interaction.user);
        }

        await this.interaction.editReply({
            content: '✅ Order completed successfully.',
        });

        await Profile.updateOne({
            _id: this.order.customerid
        },
        {
            $inc: {
                ordered: 1
            }
        }) .catch(err => {
            //SKIP
        });

        await Profile.updateOne({
            _id: this.order.farmerid
        },
        {
            $inc: {
                farmed: 1
            }
        }) .catch(err => {
            //SKIP
        });

        try {
            const completedChannel = await this.interaction.client.channels.fetch(this.order.complete) as TextChannel | NewsChannel;
            await completedChannel.send({
                embeds: [embed]
            });
        } catch(_) {}

        return true;
    }

    public async updateValue(value: number): Promise<boolean> {

        if(!this.order) return false;

        if(value>=this.order.amount) {
            return await this.completeOrder();
        }

        await Orders.updateOne({
            orderid: this.order?.orderid
        }, {
            $set: {
                amount_farmed: value
            }
        });

        try {
            const statusMessage = await (this.interaction.client.channels.cache.get(this.order.status) as TextChannel | NewsChannel).messages.fetch(this.order.statusid);
            this.order.amount_farmed = value;
            const embed = await this.completedOrderEmbed();

            await statusMessage.edit({
                embeds: [embed]
            });
        } catch(_) {
            await this.interaction.editReply({
                embeds: [
                    this.errorEmbed('I was unable to update the status message. Please try again.')
                ]
            })
            return false;
        }

        await this.interaction.editReply({
            content: '✅ Order updated successfully.',
        });

        return true;
    }

    public async cancelOrder(): Promise<void> {
        if(!this.order) return;

        if(this.order.farmerid!=='0') {
            await this.interaction.editReply({
                embeds: [
                    this.errorEmbed('This order has already been accepted.')
                ]
            })
            return;
        }

        await Orders.deleteOne({
            orderid: this.order.orderid
        });

        try {
            const pendingMessage = await (this.interaction.client.channels.cache.get(this.order.pending) as TextChannel | NewsChannel).messages.fetch(this.order.pendingid);
            await pendingMessage.delete();
        } catch (_) {}

        await this.interaction.editReply({
            content: '✅ Order cancelled successfully.',
        });
    }
}

export default OrderManager;
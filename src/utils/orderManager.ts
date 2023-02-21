import { 
    ButtonInteraction, 
    Message, 
    MessageActionRow, 
    MessageButton, 
    MessageEmbed, 
    NewsChannel, 
    TextChannel, 
    User 
} from 'discord.js';
import { 
    CustomCommandInteraction 
} from '../interfaces';
import { 
    OrdersType, 
    SettingsType 
} from "../schema";
import mongodb from './mongodb';
import {
    SoulEnums
} from './../utils'

const Orders = mongodb.models['orders'];

class OrderManager {

    private order: OrdersType | null;
    private interaction: CustomCommandInteraction;
    private customer: User | null;
    private farmer: User | null;

    constructor(interaction: CustomCommandInteraction) {
        this.interaction = interaction;
        this.order = null;
        this.customer = null;
        this.farmer = null;
    }

    public errorEmbed(message: string): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('⛔️ Error')
            .setAuthor({
                name: this.interaction.user.username,
                iconURL: this.interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
            })
            .setDescription(message)
            .setTimestamp()
            .setThumbnail(this.interaction.client.user?.displayAvatarURL({ dynamic: true, size: 1024 }) || '')

        return embed;
    }

    public async getOrder(orderId: number): Promise<boolean> {
        if (this.order) return true;
        this.order = await Orders.findOne({
            orderid: orderId
        });
        return this.order ? true : false;
    }

    private createOrderId(): number {
        return Math.trunc(Date.now() + Math.random())%100000000;
    }

    private calculateDiscount(settings: SettingsType): number {
        return 0;
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
        this.customer = await this.interaction.client.users.fetch(this.order.customerid).then((value: User) => value).catch(() => null);
    }

    private async getFarmer(): Promise<void> {
        if (!this.order) return;
        this.farmer = await this.interaction.client.users.fetch(this.order.farmerid).then((value: User) => value).catch(() => null);
    }

    public async completedOrderEmbed(): Promise<MessageEmbed> {
        if (!this.order) return new MessageEmbed();

        if (!this.farmer) await this.getFarmer();

        const embed = await this.createOrderEmbed(this.order);
        embed.setFields(
            {
                name: 'Farmer:',
                value: this.farmer?.tag || 'No Farmer',
                inline: true
            },
            {
                name: 'Customer:',
                value: this.customer?.tag || 'Error',
                inline: true
            },
            {
                name: 'Order Summary:',
                value: '```css\n' +
                `◙ Order ID: ${this.order.orderid}\n` +
                `◙ Soul: ${this.order.soulName}\n` +
                `◙ Amount: ${this.order.amount}\n` +
                `◙ Price: ${this.calculatePrice(this.order)}\n` +
                `◙ Discount: ${this.order.discount}%\n` +
                '```',
                inline: false
            }
        )
        embed.setFooter({
            text: this.farmer?.username || '',
            iconURL: this.farmer?.displayAvatarURL() || ''
        })

        return embed;

    }

    public async createOrderEmbed(orderChecker: {
        orderid: number,
        soulName: string,
        price: number
        amount: number,
        discount: number
    }): Promise<MessageEmbed> {

        if (!this.customer) await this.getCustomer();
        
        const embed = new MessageEmbed()
                    .addFields(
                        {
                            name: 'Order Summery:',
                            value: '```css\n' +
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
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel("Confirm")
                            .setEmoji('✅')
                            .setStyle('SUCCESS')
                            .setCustomId('confirm'),
                        new MessageButton()
                            .setLabel("Cancel")
                            .setEmoji('❌')
                            .setStyle('DANGER')
                            .setCustomId('cancel')
                    )
            ]
        });

        const message = await this.interaction.fetchReply() as Message<boolean>;

        const filter = (interaction: ButtonInteraction) => {
            return interaction.customId === 'confirm' || interaction.customId === 'cancel';
        }

        const collector = message.createMessageComponentCollector({ filter, time: 30000, componentType: 'BUTTON', max: 1 });

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


                    await message.delete();

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
                    await this.sendMessages(pending, settings.vacant==='0'?null:settings.vacant);

                    break;
                }
                case 'cancel': {
                    embed.setTitle('Order Cancelled');
                    embed.setDescription('Your order has been cancelled successfully.');
                    await message.edit({
                        embeds: [embed],
                        components: []
                    })

                    await this.delay(2000);

                    await message.delete();
                }
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size > 0) return;
            embed.setTitle('Order Expired');
            embed.setDescription('Your order has expired, please try again.');
            await message.edit({
                embeds: [embed],
                components: []
            })

            await this.delay(2000);

            await message.delete();
        });
    }

    public async sendMessages(channel: TextChannel | NewsChannel, content: string | null = null): Promise<void> {
        if (!this.order) {
            this.interaction.followUp({
                embeds: [
                    this.errorEmbed('Please create an order first.')
                ],
                ephemeral: true
            })
            return;
        };
        if (channel.permissionsFor(this.interaction.client.user!)?.has('SEND_MESSAGES') === false) {
            this.interaction.followUp({
                embeds: [
                    this.errorEmbed('I do not have permission to send messages in this channel.')
                ],
                ephemeral: true
            })
        };

        const embed = await this.completedOrderEmbed();

        await channel.send({
            content: null,
            embeds: [embed]
        }).catch(() => null);
    }
}

export default OrderManager;
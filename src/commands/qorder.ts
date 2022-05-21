import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, CacheType, MessageActionRow, MessageButton, Message, MessageComponentInteraction, User, GuildMemberRoleManager } from "discord.js";
import { getCard, getLocationFloor } from "../utils";
import { Card, Command, LocationFloor } from "./../interfaces";
import { SettingsType } from "../schema";

import { mongodb } from "./../utils";

const Settings = mongodb.models['settings'];

async function handelConfirmation(message: Message, customer: User) {

    const filter = ((inter: any) => {
        if ((customer.id === inter.user.id) && ['confirm', 'cancel'].indexOf(inter.customId)>=0) return true;
        return inter.reply({
            content: "You cannot use this button",
            ephemeral: true
        });
    });

    const controllor = message.createMessageComponentCollector({ filter, time: 30000, componentType: 'BUTTON' })

    controllor.on('collect', async (inter: MessageComponentInteraction<CacheType>) => {
        const id: string = inter.customId;
        await inter.deferUpdate();
        switch(id) {
            case 'confirm':
                await message.reply({
                    content: "Your order has been confirmed",
                });
                break;
            case 'cancel':
                await message.reply({
                    content: "Your order has been canceled",
                });
                break;
            default: 
                await message.reply({
                    content: "You cannot use this button 1",
                });
        }
    });
    
}

async function completeOrder(interaction: CommandInteraction<CacheType>, setting: SettingsType, card: Card, amount: number) {
    const locfl: LocationFloor = await getLocationFloor(card.SERIES);

    // If event card you cannot order it
    if (locfl.PLACE===0) {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('⛔ Error')
                    .setDescription(`You cannot order a event card like **${card.NAME}**. Don\'t try to be too smart\nIf you think this is a mistake then please contact the developer`)
                    .setAuthor({
                        name: interaction.user.username, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                    })
                    .setThumbnail(card.PICTURE)
                    .setTimestamp()
            ],
        });
        return;
    };

    const guildPrice: { [k: string]: Array<Number>} = Object.fromEntries(setting['prices'].entries());

    let setOrder = {
        orderid: Math.trunc(Date.now() + Math.random())%100000000,
        guildid: interaction.guild?.id || `${setting._id}`,
        name: card.NAME,
        image: card.PICTURE,
        farmer: setting.farmer,
        customerid: interaction.user.id,
        pending: setting.pending,
        status: setting.status,
        complete: setting.complete,
        location: card.LOCATION,
        floor: locfl.FLOORS*2 + card.FLOOR,
        amount: amount,
        price: 0,
        discount: 0,
    }

    for(const gPrice in guildPrice) {
        const range = guildPrice[gPrice];
        if (range[0] <= card.LOCATION && card.LOCATION <= range[1]) {
            setOrder.price = parseInt(gPrice) * amount;
            break;
        };
    };

    if (setOrder.price === 0) {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('⛔ Error')
                    .setDescription(`There is no price for the location **${card.LOCATION}**. Please ask the server admin to add the price for this location.`)
                    .setAuthor({
                        name: interaction.user.username, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                    })
                    .setThumbnail(card.PICTURE)
                    .setTimestamp()
            ],
        });
        return;
    }

    // Non-Stackable discount
    for (const dis of setting.disRole) {
        if ((interaction.member?.roles as GuildMemberRoleManager).cache.has(dis[0]) && setOrder.discount<dis[1]) {
            setOrder.discount = dis[1];
        }
    }

    // Stackable discount
    if (Date.now() <= (setting.disServer.get('next') as Number)) setOrder.discount += (setting.disServer.get('discount') as number);

    const embed: MessageEmbed = new MessageEmbed()
        .setColor('#00FFFF')
        .setAuthor({
            name: interaction.user.username, 
            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
        })
        .setThumbnail(card.PICTURE)
        .setTitle("Please confirm your order !!!")
        .setTimestamp()
        .addField(
            `Order Summary:  ${card.EMOJI}`, 
            `${"```"}\n◙ Card Name: ${setOrder.name}\n◙ Loc-Floor: ${setOrder.location}-${setOrder.floor}\n◙ Amount: ${amount}\n◙ Price: ${setOrder.price - Math.trunc(setOrder.price*setOrder.discount/100)}\n◙ Discount: ${setOrder.discount} \n${"```"}`
        )
    await interaction.editReply({
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
    const message = await interaction.fetchReply() as Message;
    await handelConfirmation(message, interaction.user);
}

const qorder: Command = {
    data: new SlashCommandBuilder()
        .setName('qorder')
        .setDescription('Time to order a card!')
        .addStringOption((option: SlashCommandStringOption) =>
            option
                .setName('name')
                .setDescription('The name of the card')
                .setRequired(true)
        )
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option
                .setName('amount')
                .setDescription('The amount of cards to order')
                .setRequired(true)
                .setMinValue(50)
        ),
    execute: async(interaction: CommandInteraction) => {
        await interaction.deferReply();

        const name: string = interaction.options.getString('name', true).trim();
        const amount: number = interaction.options.getInteger('amount', true);

        if (interaction.guild?.id===undefined) {
            interaction.editReply({
                content: "You cannot use this command in DM",
            })
            return
        }

        // GET SETTINGS
        const settings: SettingsType | null = await Settings.findOne({guildid: interaction.guild.id});

        // If settings not found then throw a error that setting up the bot is required
        if (settings===null) {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTitle("⛔️ Error")
                        .setDescription("Please ask the server admin to complete the settings before you can use this command here.")
                        .setTimestamp()
                        .setColor('#FF0000')
                        .setThumbnail(interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                ],
            })
            return;
        }

        // If inteaction channel is not equal to the required order channel then throw a error that you can only use this command in the order channel
        if (interaction.channelId !== settings.order && settings.order!=="0") {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTitle("⛔️ Error")
                        .setDescription("You can only use this command in the channel <#" + settings.order + ">")
                        .setTimestamp()
                        .setColor('#FF0000')
                        .setThumbnail(interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                ]
            })
            return
        }

        // Proceed to order
        getCard(name)
            .then((card: Card) => {
                completeOrder(interaction, settings, card, amount);
            })
            .catch(async(error: Error) => {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                            })
                            .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                            .setTimestamp()
                            .setColor('#FF0000')
                            .setTitle('⛔ Error')
                            .setDescription(`${error.message}`)
                    ]
                });
            })

    }
};

export default qorder;

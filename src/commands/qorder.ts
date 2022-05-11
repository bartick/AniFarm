import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, CacheType, MessageActionRow, MessageButton, Message, MessageComponentInteraction, User } from "discord.js";
import { getCard, getLocationFloor } from "../utils";
import { Card, Command, LocationFloor } from "./../interfaces";

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

async function completeOrder(interaction: CommandInteraction<CacheType>, card: Card, amount: number) {
    const locfl: LocationFloor = await getLocationFloor(card.SERIES);
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
            `${"```"}\n◙ Card Name: ${card.NAME}\n◙ Loc-Floor: ${card.LOCATION}-${locfl.FLOORS*2 + card.FLOOR}\n◙ Amount: ${amount}\n◙ Price: ${0}\n◙ Discount: ${0} \n${"```"}`
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

        getCard(name)
            .then((card: Card) => {
                completeOrder(interaction, card, amount);
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
                            .setColor('RED')
                            .setTitle('⛔ Error')
                            .setDescription(`${error.message}`)
                    ]
                });
            })

    }
};

export default qorder;

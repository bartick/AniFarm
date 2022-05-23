import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";

const paginate = async (interaction: CommandInteraction, embeds: Array<MessageEmbed>, messageReply: Message<boolean>) => {
    const buttonsRow: MessageActionRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setStyle('PRIMARY')
                .setEmoji('⏪'),
            new MessageButton()
                .setCustomId('next')
                .setStyle('PRIMARY')
                .setEmoji('⏩'),
            new MessageButton()
                .setCustomId('close')
                .setStyle('PRIMARY')
                .setEmoji('❌')
        );
    await interaction.editReply({
        embeds: [embeds[0]],
        components: [buttonsRow],
    });

    const filter = ((inter: any) => {
        if ((interaction.user.id === inter.user.id) && ['prev','next','close'].indexOf(inter.customId)>=0) return true;
        return inter.reply({
            content: "You cannot use this button",
            ephemeral: true
        });
    });

    let index = 0;
    let stop = false;

    const collector = messageReply.createMessageComponentCollector({ filter, time: 30000, componentType: 'BUTTON' });


    collector.on('collect', async (inter: MessageComponentInteraction) => {
        const id: string = inter.customId;
        await inter.deferUpdate();
        switch(id) {
            case 'prev':
                index--;
                if (index < 0) index = 0;
                await messageReply.edit({
                    embeds: [embeds[index]],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'next':
                index++;
                if (index >= embeds.length) index = embeds.length - 1;
                await messageReply.edit({
                    embeds: [embeds[index]],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'close':
                stop = true;
                await messageReply.delete();
        }
    });


    collector.on('end', async (_collected: any) => {
        if (stop) return;
        embeds[index].setColor('RED');
        buttonsRow.components[0].setDisabled(true);
        buttonsRow.components[1].setDisabled(true);
        buttonsRow.components[2].setDisabled(true);
        await messageReply.edit({
            embeds:[embeds[index]],
            components: [buttonsRow]
        })
        .catch((err: Error) => {
            console.error(err.message);
        })
    });
}


export default paginate;
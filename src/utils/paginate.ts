import { 
    CommandInteraction, 
    Message, 
    MessageActionRow, 
    MessageButton, 
    MessageComponentInteraction,
    MessageEmbed 
} from "discord.js";
import { 
    CustomCommandInteraction 
} from "../interfaces";

const paginate = async (interaction: CommandInteraction | CustomCommandInteraction, embeds: Array<MessageEmbed>, messageReply: Message<boolean>) => {
    const buttonsRow: MessageActionRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setStyle('PRIMARY')
                .setDisabled(true)
                .setEmoji('⏪'),
            new MessageButton()
                .setCustomId('next')
                .setStyle('PRIMARY')
                .setEmoji('⏩'),
            new MessageButton()
                .setCustomId('close')
                .setStyle('SECONDARY')
                .setEmoji('❌')
        );
    if (embeds.length === 1) {
        buttonsRow.components[1].setDisabled(true);
    }
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

    const collector = messageReply.createMessageComponentCollector({ filter, time: 60000, componentType: 'BUTTON' });


    collector.on('collect', async (inter: MessageComponentInteraction) => {
        const id: string = inter.customId;
        await inter.deferUpdate();
        switch(id) {
            case 'prev':
                if (buttonsRow.components[1].disabled) buttonsRow.components[1].disabled = false;
                index--;
                if (index==0) buttonsRow.components[0].disabled = true;
                await messageReply.edit({
                    embeds: [embeds[index]],
                    components: [buttonsRow],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'next':
                if (buttonsRow.components[0].disabled) buttonsRow.components[0].disabled = false;
                index++;
                if (index==embeds.length-1) buttonsRow.components[1].disabled = true;
                await messageReply.edit({
                    embeds: [embeds[index]],
                    components: [buttonsRow],
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
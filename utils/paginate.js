const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = async (interaction, embeds, index) => {
    const length = embeds.length;
    if (index===undefined || index<0 || index>=length) {
        index=0
    };
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('left')
            .setStyle('PRIMARY')
            .setEmoji('⬅️'),
        new MessageButton()
            .setCustomId('right')
            .setStyle('PRIMARY')
            .setEmoji('➡️'),
        new MessageButton()
            .setCustomId('delete')
            .setStyle('SECONDARY')
            .setEmoji('🗑')
    );
    if (index===0) row.components[0].disabled=true;
    if (index===length-1) row.components[1].disabled=false;
    await interaction.reply({
        embeds: [embeds[index]],
        components: [row]
    });

    const filter = (inter) => {
        if ((interaction.user.id === inter.user.id) && ['left','right','delete'].indexOf(inter.customId)>=0) return true;
        return inter.reply({
            content: "You cannot use this button",
            ephemeral: true
        })
    };

    const message = await interaction.fetchReply()

    const collector = message.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
        const id = i.customId;
        if (id==='left') {
            await i.deferUpdate();
            if (row.components[1].disabled) {
                row.components[1].disabled=false
            }
            if(index>0) {
                index--;
                if (index===0) {
                    row.components[0].disabled=true
                }
                await interaction.editReply({
                    embeds: [embeds[index]],
                    components: [row]
                })
            }
        }
        else if (id==='right') {
            await i.deferUpdate();
            if (row.components[0].disabled) {
                row.components[0].disabled=false
            }
            if(index<length-1) {
                index++;
                if (index===length-1) {
                    row.components[1].disabled=true
                }
                await interaction.editReply({
                    embeds: [embeds[index]],
                    components: [row]
                })
            }
        }
        else {
            await i.deferUpdate();
            await interaction.deleteReply()
        }
    });
};
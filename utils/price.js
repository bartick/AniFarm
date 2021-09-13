const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
    async (interaction) {
        const location = [
            new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('range')
                    .setMinValues(2)
                    .setMaxValues(2)
                    .setPlaceholder('Select the location')
                    .addOptions([
                        { label: '0', value: '0' },
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3' },
                        { label: '4', value: '4' },
                        { label: '5', value: '5' },
                        { label: '6', value: '6' },
                        { label: '7', value: '7' },
                        { label: '8', value: '8' },
                        { label: '9', value: '9' }
                    ])
            ),
            new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm')
                    .setDisabled(true)
                    .setLabel('Confirm')
                    .setEmoji('✅')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('Cancel')
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle('DANGER')
            )
        ];
        const embed = new MessageEmbed()
                .setColor('AQUA')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setDescription(`${'```js\n'}# 1 | 1 to "set"  →  null\n\n${'\n```'}`)
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp()
        await interaction.reply({
            embeds: [embed],
            components: location
        });
        const message  = await interaction.fetchReply();
        const filter = (inter) => {
            if (interaction.user.id === inter.user.id) return true;
            return inter.reply({
                content: "You cannot use this button",
                ephemeral: true
            })
        };
        const settings = {};
        let price = null;
        let priceRange = [1, null];
        let index = 1;
    
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async inter => {
            const id = inter.customId;
            let updated = false;
            if (id==='range') {
                if(index===1) {
                    priceRange[1] = parseInt((inter.values).join(''));
                    if (priceRange[1]>67) priceRange[1] = 67;
                    if (priceRange[1]<priceRange[0]) {
                        priceRange[1] = null;
                        await inter.update({
                            components: location
                        });
                        await inter.followUp({
                            content: `<@${interaction.user.id}>`,
                            ephemeral: true,
                            embeds: [
                                new MessageEmbed()
                                    .setColor('RED')
                                    .setTitle('⛔️ Error')
                                    .setThumbnail(inter.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setTimestamp()
                                    .setAuthor(inter.user.username, inter.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setDescription('Starting of the range is larger than ending which is not practical. Please be practical and re-enter again.')
    
                            ]
                        });
                        updated = true;
                    }
                    else {
                        index++;
                        if(index==2) {
                            location[0].components[0].setMinValues(1);
                            location[0].components[0].setMaxValues(null);
                        }
                    }
                }
                else {
                    price = parseInt((inter.values).join(''));
                    settings[price] = priceRange;
                    priceRange = [priceRange[1]+1, null];
                    price = null;
                    index = 1;
                    location[0].components[0].setMinValues(2);
                    location[0].components[0].setMaxValues(2);
                    if (settings[price]==67) {
                        location.shift();
                        location[0].components[0].setDisabled(false);
                    };
                }
                if (!updated) {
                    let description = '';
                    let pos=0;
                    for(const key in settings) {
                        description = description+`${pos+1} | ${settings[key][0]} to ${settings[key][1]}  →  ${key}\n`
                        pos++;
                    }
                    if(index===1) {
                        description = description+`# ${pos+1} | ${priceRange[0]} to "${priceRange[1]===null?'set':priceRange[1]}"  →  ${price}\n`
                    }
                    else {
                        description = description+`# ${pos+1} | ${priceRange[0]} to ${priceRange[1]}  →  "${price===null?'set':price}"\n`
                    }
                    embed.setDescription(`${'```js\n'}${description}${'\n```'}`);
                    await inter.update({
                        embeds: [embed],
                        components: location
                    });
                }
            }
            else if (id==='confirm') {
                await inter.deferUpdate();
                await inter.message.delete();
                console.log(settings);
                return settings;
            }
            else {
                await inter.deferUpdate()
                await inter.message.delete();
                collector.stop();
            }
        })
    }
};
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    async get(interaction) {
        const row1= new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('1')
                        .setLabel('1')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('2')
                        .setLabel('2')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('3')
                        .setLabel('3')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('right')
                        .setEmoji('➡️')
                        .setStyle('SECONDARY')
                )
            const row2 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('4')
                        .setLabel('4')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('5')
                        .setLabel('5')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('6')
                        .setLabel('6')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('left')
                        .setEmoji('⬅️')
                        .setStyle('SECONDARY')
                )
            const row3 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('7')
                        .setLabel('7')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('8')
                        .setLabel('8')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('9')
                        .setLabel('9')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('confirm')
                        .setEmoji('✅')
                        .setStyle('SUCCESS')
                )
            const row4 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('down')
                        .setEmoji('⬇️')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('0')
                        .setLabel('0')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('up')
                        .setEmoji('⬆️')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('cancel')
                        .setEmoji('❌')
                        .setStyle('DANGER')
                )
            await interaction.reply({
                content: 'Test',
                components: [
                    row1,
                    row2,
                    row3,
                    row4
                ]
            });
            const message = await interaction.fetchReply();
            const filter = (inter) => {
                if (interaction.user.id === inter.user.id) return true;
                return inter.reply({
                    content: "You cannot use this button",
                    ephemeral: true
                })
            };
            const price = {};
            const priceRange = ['',''];
            const cost = '';
            const place = 0;
            const height = 1;
            const index = 0;
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });
            collector.on('collect', async i => {
                await i.deferUpdate();
                const id = i.setCustomId;
                // const num = parseInt(id);
                if (isNaN(id)) {
                    if (id==='right') {
                        if (place===0 || place===2) {
                            index = priceRange[place].length()===index+1 ? index : index+1;
                        }
                        else {
                            index = cost.length()===index+1 ? index: index+1;
                        }
                    }
                    else if (id=='left') {
                        index = index===0 ? index : index-1;
                    }
                    else if (id==='down') {
                        const keys = Object.keys(price);
                        if (height===keys.length) {
                            price[cost] = [parseInt(priceRange[0]), parseInt(priceRange[1])];
                            priceRange = ['', ''];
                            cost = '';
                            index = 0;
                            place = 0
                        }
                        else {
                            if (height < keys.length) {
                                height++;
                                
                            } 
                        }
                    }
                    else if (id==='up') {
                        //TODO
                    }
                    else if(id==='confirm') {
                        //TODO
                    }
                    else {
                        //TODO
                    }
                }
                else {
                    if (place===0 || place==1) {
                        priceRange[place].replace(priceRange[place][index], id);
                        if(index===0) {
                            index=2;
                        }
                        else {
                            index=0;
                            place++;
                        };
                    }
                    else {
                        cost.replace(cost[index], id);
                        index++;
                    };
                };
            })
    }
};
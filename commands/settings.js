const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const settings = require('./../models/settings');

async function setDefault(subSettings, guildId) {
    subSettings['_id'] = guildId;
    const first = new settings(subSettings);
    await first.save();
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('settings')
            .setDescription('Completes the default settings of the server')
            .addSubcommand( subcommand => 
                subcommand
                    .setName('guild')
                    .setDescription('Completes Guild Settings')
                    .addChannelOption(option => 
                        option.setName('order')
                        .setDescription('Channel where users will order')
                    )
                    .addChannelOption(option => 
                        option.setName('pending')
                        .setDescription('Channel where pending orders will stack')
                    )
                    .addChannelOption(option => 
                        option.setName('status')
                        .setDescription('Channel where the status of order will be shown')
                    )
                    .addChannelOption(option => 
                        option.setName('complete')
                        .setDescription('Channel to send completed order')
                    )
            )
            .addSubcommand(subcommand =>
                subcommand 
                    .setName('prices')
                    .setDescription('Completes Farming Settings')
            )
            .addSubcommand( subcommand =>
                subcommand.setName('roles')
                .setDescription('Set roles for the farmers')
                .addRoleOption(option => 
                    option.setName('farmer')
                    .setDescription('Add the farming role')
                )
                .addRoleOption(option => 
                    option.setName('vacant')
                    .setDescription('Farmers with this role are vacant')
                )
                .addRoleOption(option =>
                    option.setName('occupied')
                    .setDescription('Farmers with this role is occupied')
                )
                .addRoleOption(option => 
                    option.setName('unavailable')
                    .setDescription('Farmers with this role are unavailable')
                )
            )
            .addSubcommand(subcommand =>
                subcommand.setName('view')
                .setDescription('View your settings')
            ),
    async execute(interaction) {

        if(!(interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTitle('⛔️ Error')
                        .setColor('RED')
                        .setDescription('You do not have **Manage Server** permission to use this command. Please ask a user with the permission to use the command for you.')
                ]
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        const subSettings = {};
        if (subcommand==='guild') {
            subSettings['order'] = interaction.options.getChannel('order');
            subSettings['pending'] = interaction.options.getChannel('pending');
            subSettings['status'] = interaction.options.getChannel('status');
            subSettings['complete'] = interaction.options.getChannel('complete');

            const embed = new MessageEmbed()
                .setTitle('Guild Settings')
                .setColor('AQUA')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp()

            for (const key in subSettings) {
                embed.addField(key.toUpperCase(), subSettings[key]===null ? 'Not Effected' : `<#${subSettings[key].id}>`, false);
                subSettings[key]===null ? delete subSettings[key] : subSettings[key] = subSettings[key].id;
            }
            const check = await settings.updateOne({_id: guildId}, {$set: subSettings});
            if (check.matchedCount==0) {
                await setDefault(subSettings, guildId);
            }
            await interaction.reply({
                embeds: [embed]
            })
        }
        else if (subcommand==='prices') {
            let location = [
                new MessageActionRow()
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
                        .setCustomId('delete')
                        .setEmoji('🕒')
                        .setStyle('SECONDARY')
                ),
        
                new MessageActionRow()
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
                        .setCustomId('right')
                        .setEmoji('👉')
                        .setStyle('SECONDARY')
                ),
                
                new MessageActionRow()
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
                        .setCustomId('left')
                        .setEmoji('👈')
                        .setStyle('SECONDARY')
                ),
        
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('0')
                        .setLabel('0')
                        .setStyle('PRIMARY'),
                    
                    new MessageButton()
                        .setCustomId('confirm')
                        .setDisabled(true)
                        .setEmoji('✅')
                        .setStyle('SUCCESS'),
                    
                    new MessageButton()
                        .setCustomId('Cancel')
                        .setEmoji('⚔️')
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
            const setting = {};
            let price = 0;
            let priceRange = [1, 0];
            let index = 1;
            let inputed = 0;
        
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });
            collector.on('collect', async inter => {
                const id = inter.customId;
                let toUpdate = false;
                if (!(isNaN(parseInt(id)))) {
                    if (index==1) {
                        priceRange[1] = priceRange[1]*10 + parseInt(id);
                        inputed++;
                        if (inputed==2) {
                            if (price>0) {
                                location[3].components[1].setDisabled(false);
                                inputed = 0;
                            }
                            if (priceRange[1]>67) priceRange[1] = 67;
                            if (priceRange[1]<priceRange[0]) {
                                priceRange[1] = 0;
                                inputed = 0;
                                let description = '';
                                let pos=0;
                                for(const key in setting) {
                                    description = description+`${pos+1} | ${setting[key][0]} to ${setting[key][1]}  →  ${key}\n`
                                    pos++;
                                }
                                if(index===1) {
                                    description = description+`# ${pos+1} | ${priceRange[0]} to "${priceRange[1]===0?'set':priceRange[1]}"  →  ${price}\n`;
                                }
                                else {
                                    if (index===2) {
                                        description = description+`# ${pos+1} | ${priceRange[0]} to ${priceRange[1]}  →  "${price===0?'set':price}"\n`;
                                    };
                                }
                                embed.setDescription(`${'```js\n'}${description}${'\n```'}`);
                                await inter.update({
                                    embeds: [embed],
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
                            }
                            else {
                                index++
                                toUpdate = true;
                            }
                        }
                        else {
                            toUpdate = true
                        }
                    }
                    else {
                        if (inputed===2) {
                            location[3].components[1].setDisabled(false);
                            inputed = 0;
                        }
                        price = price*10 + parseInt(id);
                        toUpdate = true;
                    }
                }
        
                else if (id==='confirm') {
                    setting[price] = priceRange;
                    if (priceRange[1]===67) {
                        location = [];
                        index = 0;
                        toUpdate = true;
                    }
                    else {
                        priceRange = [priceRange[1]+1, 0];
                        price = 0;
                        index = 1;
                        toUpdate = true;
                        location[3].components[1].setDisabled(true);
                    }
                }

                else if (id==='delete') {
                    if (index===1) {
                        priceRange[1] = parseInt(priceRange[1]/10);
                    }
                    else {
                        price = parseInt(price/10);
                        if (price===0) {
                            location[3].components[1].setDisabled(true);
                            inputed = 2;
                        }
                    }
                    toUpdate = true;
                }

                else if (id==='right') {
                    if (priceRange[1]<priceRange[0]) {
                        priceRange[1] = 0;
                        inputed = 0;
                        let description = '';
                        let pos=0;
                        for(const key in setting) {
                            description = description+`${pos+1} | ${setting[key][0]} to ${setting[key][1]}  →  ${key}\n`
                            pos++;
                        }
                        if(index===1) {
                            description = description+`# ${pos+1} | ${priceRange[0]} to "${priceRange[1]===0?'set':priceRange[1]}"  →  ${price}\n`;
                        }
                        else {
                            if (index===2) {
                                description = description+`# ${pos+1} | ${priceRange[0]} to ${priceRange[1]}  →  "${price===0?'set':price}"\n`;
                            };
                        }
                        embed.setDescription(`${'```js\n'}${description}${'\n```'}`);
                        await inter.update({
                            embeds: [embed],
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
                    }
                    else {
                        inputed = 2;
                        index = 2;
                        price = 0;
                        toUpdate = true;
                    }
                }

                else if (id==='left') {
                    index=1;
                    priceRange[1] = 0;
                    inputed = 0;
                    location[3].components[1].setDisabled(true);
                    toUpdate = true;
                }
        
                else {
                    await inter.deferUpdate()
                    await inter.message.delete();
                    collector.stop();
                }
        
                if (toUpdate) {
                    let description = '';
                    let pos=0;
                    for(const key in setting) {
                        description = description+`${pos+1} | ${setting[key][0]} to ${setting[key][1]}  →  ${key}\n`
                        pos++;
                    }
                    if(index===1) {
                        description = description+`# ${pos+1} | ${priceRange[0]} to "${priceRange[1]===0?'set':priceRange[1]}"  →  ${price}\n`;
                    }
                    else {
                        if (index===2) {
                            description = description+`# ${pos+1} | ${priceRange[0]} to ${priceRange[1]}  →  "${price===0?'set':price}"\n`;
                        };
                    }
                    embed.setDescription(`${'```js\n'}${description}${'\n```'}`);
                    await inter.update({
                        embeds: [embed],
                        components: location
                    });
        
                    if (priceRange[1]===67 && index===0) {
                        subSettings['prices'] = setting;
                        const check = await settings.updateOne({_id: guildId}, {$set: subSettings});
                        if (check.matchedCount==0) {
                            await setDefault(subSettings, guildId);
                        }
                    };
                }
            });
        }
        else if (subcommand==='roles') {
            subSettings['roles'] = {}
            subSettings['roles']['farmer'] = interaction.options.getRole('farmer');
            subSettings['roles']['vacant'] = interaction.options.getRole('vacant');
            subSettings['roles']['occupied'] = interaction.options.getRole('occupied');
            subSettings['roles']['unavailable'] = interaction.options.getRole('unavailable');

            const embed = new MessageEmbed()
                .setTitle('Guild Settings')
                .setColor('AQUA')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp()

            for (const key in subSettings['roles']) {
                embed.addField(key.toUpperCase(), subSettings['roles'][key]===null ? 'Removed' : `<@&${subSettings['roles'][key].id}>`, false);
                subSettings['roles'][key]===null ? subSettings['roles'][key]=0 : subSettings['roles'][key] = subSettings['roles'][key].id;
            }
            const check = await settings.updateOne({_id: guildId}, {$set: subSettings});
            if (check.matchedCount==0) {
                await setDefault(subSettings, guildId);
            }
            await interaction.reply({
                embeds: [embed]
            })
        }
        else {
            await interaction.reply({
                ephemeral: true,
                content: 'Not completed yet'
            })
            const prices = ''
            const embed = [
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Settings')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .addField('1 | Order Channel', guildSettings.order===0?'Not Yet Set':`<#${guildSettings.order}>`, false)
                    .addField('2 | Pending Channel', guildSettings.pending===0?'Not Yet Set':`<#${guildSettings.pending}>`, false)
                    .addField('3 | Status Channel', guildSettings.status===0?'Not Yet Set':`<#${guildSettings.status}>`, false)
                    .addField('4 | Complete Channel', guildSettings.complete===0?'Not Yet Set':`<#${guildSettings.complete}>`, false)
                    .setFooter('Page 1/4'),
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Prices')
                    .setDescription("```\n"+prices+"\n```")
                    .setFooter('Page 2/4'),
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Discounts')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setFooter('Page: 3/4'),
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Roles')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .addField('1 | Farmer', guildSettings.roles.farmer===0?'Not Yet Set':`<@&${guildSettings.roles.farmer}>`, false)
                    .addField('2 | Vacant', guildSettings.roles.vacant===0?'Not Yet Set':`<@&${guildSettings.roles.vacant}>`, false)
                    .addField('3 | Occupied', guildSettings.roles.occupied===0?'Not Yet Set':`<@&${guildSettings.roles.occupied}>`, false)
                    .addField('4 | Unavailable', guildSettings.roles.unavailable===0?'Not Yet Set':`<@&${guildSettings.roles.unavailable}>`,false)
                    .setFooter('Page: 4/4')
            ]
        };
    }
};
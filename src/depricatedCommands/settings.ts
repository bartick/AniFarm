import { 
    SlashCommandBuilder, 
    SlashCommandChannelOption, 
    SlashCommandRoleOption, 
    SlashCommandSubcommandBuilder 
} from "@discordjs/builders";
import { 
    CacheType,
    GuildMember, 
    Message, 
    MessageActionRow, 
    MessageButton, 
    MessageComponentInteraction, 
    MessageEmbed,
} from "discord.js";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import { SettingsType } from "../schema";
import {
    mongodb,
    paginate
} from '../utils';

const Settings = mongodb.models['settings'];
const MAX_LOCATION = 70;

const settings: Command = {
    data: new SlashCommandBuilder()
            .setName('settings')
            .setDescription('Completes the default settings of the server')
            .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
                subcommand
                    .setName('guild')
                    .setDescription('Completes Guild Settings')
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option.setName('order')
                        .setDescription('Channel where users will order')
                    )
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option.setName('pending')
                        .setDescription('Channel where pending orders will stack')
                    )
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option.setName('status')
                        .setDescription('Channel where the status of order will be shown')
                    )
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option.setName('complete')
                        .setDescription('Channel to send completed order')
                    )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand 
                    .setName('prices')
                    .setDescription('Completes Farming Settings')
            )
            .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) =>
                subcommand.setName('roles')
                .setDescription('Set roles for the farmers')
                .addRoleOption((option: SlashCommandRoleOption) => 
                    option.setName('farmer')
                    .setDescription('Add the farming role')
                )
                .addRoleOption((option: SlashCommandRoleOption) => 
                    option.setName('vacant')
                    .setDescription('Farmers with this role are vacant')
                )
                .addRoleOption((option: SlashCommandRoleOption) =>
                    option.setName('occupied')
                    .setDescription('Farmers with this role is occupied')
                )
                .addRoleOption((option: SlashCommandRoleOption) => 
                    option.setName('unavailable')
                    .setDescription('Farmers with this role are unavailable')
                )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand.setName('view')
                .setDescription('View your settings')
            ),
    execute: async ( interaction: CustomCommandInteraction ) => {
        if(!((interaction.member as GuildMember).permissions.has('MANAGE_GUILD')) && !(interaction.user.id==='707876147324518440')) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setTitle('⛔️ Error')
                        .setColor('#FF0000')
                        .setDescription('You do not have **Manage Server** permission to use this command. Please ask a user with the permission to use the command for you.')
                ]
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        const subSettings: {
            [key: string]: string | undefined
        } = {};
        let temp: any;
        switch (subcommand) {
            case 'guild': {
                const embed = new MessageEmbed()
                                .setTitle('Guild Settings')
                                .setColor('#00FFFF')
                                .setAuthor({
                                    name: interaction.user.username, 
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                .setTimestamp()
                                .setDescription('You are only allowed to use text channels or news channels. If you put any channel other than text channel then the settings will be not accepted.')
                temp = {
                    order: interaction.options.getChannel('order', false),
                    pending: interaction.options.getChannel('pending', false),
                    status: interaction.options.getChannel('status', false),
                    complete: interaction.options.getChannel('complete', false)
                }
                for (const key in temp) {
                    if(temp[key]?.type==='GUILD_TEXT' || temp[key]?.type==='GUILD_NEWS') {
                        subSettings[key] = temp[key].id as string;
                        embed.addFields(
                            {
                                name: `• ${key.toUpperCase()}`,
                                value: `<#${subSettings[key]}>`,
                                inline: false
                            }
                        )
                    }
                }
                if((Object.keys(subSettings)).length===0) {
                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTimestamp()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                .setTitle('⛔️ Error')
                                .setColor('#ff0000')
                                .setDescription('You atleast need to use one of the options. If you do not want to use any of the options then use `/settings view` to view your settings.')
                        ]
                    })
                    return;
                };
                
                const check = await Settings.updateOne({_id: guildId}, {$set: subSettings});
                if(check.modifiedCount==0) {
                    const newGuildSettings = new Settings({
                        _id: guildId,
                        ...subSettings
                    });
                    await newGuildSettings.save();
                }
                await interaction.reply({
                    embeds: [embed]
                })
                break;
            }
            case 'prices': {
                let setterButtons = [
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
                                .setDisabled(true)
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
                ]

                const embed = new MessageEmbed()
                                .setTitle('Prices Settings')
                                .setDescription(`${'```js\n'}# 1 | 1 to "set"  →  null\n\n${'\n```'}`)
                                .setColor('#00FFFF')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setTimestamp()
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                await interaction.reply({
                    embeds: [embed],
                    components: setterButtons
                });
                const message  = await interaction.fetchReply() as Message<boolean>;

                const filter = (inter: any) => {
                    if (interaction.user.id === inter.user.id) return true;
                    return inter.reply({
                        content: "You cannot use this button",
                        ephemeral: true
                    })
                };

                const setting: {
                    [key: string]: [number, number]
                } = {};
                let price = 0;
                let priceRange: [number, number] = [1, 0];
                let index = 1;
                let toUpdate: boolean = false;

                const collector = message.createMessageComponentCollector({filter, time: 60000});
                collector.on('collect', async (inter: MessageComponentInteraction<CacheType>) => {
                    const id: string = inter.customId;
                    switch (!isNaN(Number(id))? 'Number': id) {
                        case 'Number': {
                            if (index===1) {
                                priceRange[1] = priceRange[1]*10 + Number(id);
                                if(priceRange[1]>=MAX_LOCATION) priceRange[1] = MAX_LOCATION;
                                if (priceRange[1].toString().length===2) {
                                    index = 2;
                                }
                            } else {
                                price = price*10 + Number(id);
                            }
                            break;
                        }
                        case 'delete': {
                            if(index===0 || index===1) {
                                priceRange[index] = Math.trunc(priceRange[index]/10);
                            } else {
                                price = Math.trunc(price/10);
                            }
                            break;
                        }
                        case 'left': {
                            index = 1;
                            break;
                        }
                        case 'right': {
                            index = 2;
                            if (priceRange[1]<priceRange[0]){
                                await inter.reply({
                                    content: "Please provide a valid price range...",
                                    ephemeral: true
                                });
                            }
                            break;
                        }
                        case 'confirm': {
                            setting[`${price}`] = priceRange;
                            if(priceRange[1]===MAX_LOCATION) {
                                if(!toUpdate) toUpdate = true;
                                collector.stop();
                                break;
                            }
                            index = 1;
                            priceRange = [priceRange[1]+1, 0];
                            price = 0;
                            break;
                        }
                        case 'Cancel': {
                            await (inter.message as Message<boolean>).delete();
                            collector.stop();
                            return;
                        }
                        default: {}
                    };
                    
                    let description = ''
                    let pos = 0;
                    for (const [key, value] of Object.entries(setting)) {
                        description += `# ${++pos} | ${value[0]} to ${value[1]} → ${key}\n`
                    }

                    if(!toUpdate) {
                        if (index===1) {
                            description += `# ${++pos} | ${priceRange[0]} to "${priceRange[1]>0?priceRange[1]:'set'}" → ${price>0?price:'set'}\n`
                        } else {
                            description += `# ${++pos} | ${priceRange[0]} to ${priceRange[1]>0?priceRange[1]:'set'} → "${price>0?price:'set'}"\n`
                        }
                    } else {
                        const check = await Settings.updateOne({guild: interaction.guildId}, {
                            $set: {
                                prices: setting
                            }
                        });
                        if(check.modifiedCount===0) {
                            const newGuildSettings = new Settings({
                                _id: guildId,
                                prices: setting
                            });
                            await newGuildSettings.save();
                        }
                    }

                    embed.description = `${'```js\n'}${description}${'\n```'}`;

                    if(price>0 && priceRange[1]>0 && setterButtons[3].components[1].disabled) {
                        setterButtons[3].components[1].setDisabled(false);
                    } else if((price===0 || priceRange[1]===0) && !setterButtons[3].components[1].disabled) {
                        setterButtons[3].components[1].setDisabled(true);
                    }

                    if(index==1) {
                        setterButtons[2].components[3].setDisabled(true);
                        setterButtons[1].components[3].setDisabled(false);
                    } else {
                        setterButtons[1].components[3].setDisabled(true);
                        setterButtons[2].components[3].setDisabled(false);
                    }

                    await inter.update({
                        embeds: [embed],
                        components: toUpdate? []: setterButtons
                    });
                });

                break;
            }
            case 'roles': {
                const embed = new MessageEmbed()
                                .setTitle('Roles Settings')
                                .setColor('#00FFFF')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                .setTimestamp()
                                .setDescription('You are only allowed to use roles. If you put any other thing then the settings will be not accepted.')
                temp = {
                    farmer: interaction.options.getRole('farmer'),
                    vacant: interaction.options.getRole('vacant'),
                    occupied: interaction.options.getRole('occupied'),
                    unavailable: interaction.options.getRole('unavailable')
                }
                for (const key in temp) {
                    if(temp[key]) {
                        subSettings[key] = temp[key].id as string;
                        embed.addFields(
                            {
                                name: `• ${key.toUpperCase()}`,
                                value: `<@&${subSettings[key]}>`,
                                inline: false
                            }
                        )
                    }
                }
                if((Object.keys(subSettings)).length===0) {
                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTimestamp()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                .setTitle('⛔️ Error')
                                .setColor('#ff0000')
                                .setDescription('You atleast need to use one of the options. If you do not want to use any of the options then use `/settings view` to view your settings.')
                        ]
                    })
                    return;
                }

                const check = await Settings.updateOne({_id: guildId}, {$set: subSettings});
                if(check.modifiedCount==0) {
                    const newGuildSettings = new Settings({
                        _id: guildId,
                        ...subSettings
                    });
                    await newGuildSettings.save();
                }
                await interaction.reply({
                    embeds: [embed]
                })
                break;
            }
            case 'view': {
                const guildSettings: SettingsType | null = await Settings.findOne({_id: guildId});

                if(!guildSettings) {
                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTimestamp()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                .setTitle('⛔️ Error')
                                .setColor('#ff0000')
                                .setDescription('You have not set any settings yet. Use `/settings` to set your settings.')
                        ]
                    })
                    return;
                }

                const messageToPaginate = await interaction.deferReply({
                    fetchReply: true
                }) as Message<boolean>;
                let prices = '';
                let pos = 0;
                const guildPrices = Object.fromEntries((guildSettings.prices).entries());
                for (const key in guildPrices) {
                    prices  = prices + `${++pos} | ${guildPrices[key][0]} to ${guildPrices[key][1]}  →  ${key}\n`
                };

                const embeds = [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setTitle('Settings')
                        .setColor('#00FFFF')
                        .addFields(
                            {
                                name: '1 | Order Channel', 
                                value: guildSettings.order==='0'?'Not Yet Set':`<#${guildSettings.order}>`, 
                                inline: false
                            },
                            {
                                name: '2 | Pending Channel',
                                value:  guildSettings.pending==='0'?'Not Yet Set':`<#${guildSettings.pending}>`, 
                                inline: false
                            },
                            {
                                name: '3 | Status Channel', 
                                value: guildSettings.status==='0'?'Not Yet Set':`<#${guildSettings.status}>`, 
                                inline: false
                            },
                            {
                                name: '4 | Complete Channel', 
                                value: guildSettings.complete==='0'?'Not Yet Set':`<#${guildSettings.complete}>`, 
                                inline: false
                            }
                        )
                        .setFooter({
                            text: 'Page 1/3'
                        }),
                    new MessageEmbed()
                        .setTimestamp()
                        .setColor('#00FFFF')
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                        })
                        .setTitle('Prices')
                        .setDescription("```\n"+prices+"\n```")
                        .setFooter({
                            text: 'Page 2/3'
                        }),
                    new MessageEmbed()
                        .setTimestamp()
                        .setColor('AQUA')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTitle('Roles')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .addFields(
                            {
                                name: '1 | Farmer', 
                                value: guildSettings.farmer==='0'?'Not Yet Set':`<@&${guildSettings.farmer}>`, 
                                inline: false
                            },
                            {
                                name: '2 | Vacant', 
                                value: guildSettings.vacant==='0'?'Not Yet Set':`<@&${guildSettings.vacant}>`, 
                                inline: false
                            },
                            {
                                name: '3 | Occupied', 
                                value: guildSettings.occupied==='0'?'Not Yet Set':`<@&${guildSettings.occupied}>`, 
                                inline: false},
                            {
                                name: '4 | Unavailable', 
                                value: guildSettings.unavailable==='0'?'Not Yet Set':`<@&${guildSettings.unavailable}>`,
                                inline: false
                            }
                            )
                        .setFooter({
                            text: 'Page 3/3'
                        })
                ]
                await paginate(interaction, embeds, messageToPaginate);
                break;
            }
            default: {
                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTimestamp()
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                            })
                            .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                            .setTitle('⛔️ Error')
                            .setColor('#ff0000')
                            .setDescription('This subcommand was not implemented yet. Please wait for it to be implemented. If you think this is a mistake please report it to the support server.')
                    ]
                });
            }
        };
    }
};

export default settings;
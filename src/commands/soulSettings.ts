import { 
    SlashCommandBuilder, 
    SlashCommandChannelOption, 
    SlashCommandRoleOption,
} from '@discordjs/builders';
import { 
    GuildMember, 
    Message, 
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType
} from 'discord.js';
import {
    Command, 
    CustomCommandInteraction
} from './../interfaces';
import {
    mongodb,
    ModalActionRow,
    paginate,
} from './../utils';

const Settings = mongodb.models['settings'];

const soulSettings: Command = {
    data: new SlashCommandBuilder()
            .setName('settings')
            .setDescription('Manage the settings for your server')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('price')
                    .setDescription('Set the price for a soul')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('role')
                    .setDescription('Set the role for a farming')
                    .addRoleOption((option: SlashCommandRoleOption) => 
                        option
                            .setName('farmer')
                            .setDescription('Add the farming role')
                    )
                    .addRoleOption((option: SlashCommandRoleOption) => 
                        option
                            .setName('vacant')
                            .setDescription('Farmers with this role are vacant')
                    )
                    .addRoleOption((option: SlashCommandRoleOption) =>
                        option
                            .setName('occupied')
                            .setDescription('Farmers with this role is occupied')
                    )
                    .addRoleOption((option: SlashCommandRoleOption) => 
                        option
                            .setName('unavailable')
                            .setDescription('Farmers with this role are unavailable')
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('channel')
                    .setDescription('Set the channel for a farming')
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option
                            .setName('order')
                            .setDescription('Channel where users will order')
                    )
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option
                            .setName('pending')
                            .setDescription('Channel where pending orders will stack')
                    )
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option
                            .setName('status')
                            .setDescription('Channel where the status of order will be shown')
                    )
                    .addChannelOption((option: SlashCommandChannelOption) => 
                        option
                            .setName('complete')
                            .setDescription('Channel to send completed order')
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('view')
                    .setDescription('View the settings for your server')
            )
            ,
    execute: async (interaction: CustomCommandInteraction) => {

        if(!((interaction.member as GuildMember).permissions.has('ManageGuild')) && !(interaction.user.id==='707876147324518440')) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({ size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
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

        switch(subcommand) {
            case 'price': {

                const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({ size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
                                .setTimestamp()
                
                const priceModal = new ModalBuilder()
                                        .setTitle('Price Settings')
                                        .setCustomId('price')
                
                const priceRow = new ModalActionRow()
                                        .addComponents(
                                            new TextInputBuilder()
                                                .setCustomId('price')
                                                .setLabel('What will be the price of 1 soul?')
                                                .setPlaceholder('Write the price for a single soul')
                                                .setRequired(true)
                                                .setMinLength(1)
                                                .setMaxLength(10)
                                                .setStyle(TextInputStyle.Short)
                                        )
                
                priceModal.addComponents(priceRow);

                await interaction.showModal(priceModal);

                const priceCollector = await interaction.awaitModalSubmit({
                    time: 60000,
                });

                if(!priceCollector) {
                    await interaction.editReply({
                        embeds: [
                            embed
                                .setTitle('⛔️ Error')
                                .setColor('#FF0000')
                                .setDescription('You did not provide the price for a soul. Please try again.')
                        ]
                    });
                    return;
                }

                const price = priceCollector.fields.getTextInputValue('price');

                if(isNaN(Number(price))) {
                    await priceCollector.reply({
                        embeds: [
                            embed
                                .setTitle('⛔️ Error')
                                .setColor('#FF0000')
                                .setDescription('You did not provide a valid number. Please try again.')
                        ]
                    });
                    return;
                }

                const check = await Settings.updateOne({
                    _id: guildId
                }, {
                    $set: {
                        soul: Number(price)
                    }
                })

                if(check.modifiedCount === 0) {
                    await Settings.create({
                        _id: guildId,
                        soul: Number(price)
                    })
                }

                await priceCollector.reply({
                    embeds: [
                        embed
                            .setTitle('Success')
                            .setColor('#00FF00')
                            .setDescription(`You have successfully set the price for a soul to **${price}**`)
                    ]
                });

                break;
            }
            case 'channel': {
                const embed = new EmbedBuilder()
                                .setTitle('Guild Settings')
                                .setColor('#00FFFF')
                                .setAuthor({
                                    name: interaction.user.username, 
                                    iconURL: interaction.user.displayAvatarURL({ size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
                                .setTimestamp()
                                .setDescription('You are only allowed to use text channels or news channels. If you put any channel other than text channel then the settings will be not accepted.')
                temp = {
                    order: interaction.options.getChannel('order', false),
                    pending: interaction.options.getChannel('pending', false),
                    status: interaction.options.getChannel('status', false),
                    complete: interaction.options.getChannel('complete', false)
                };

                for (const key in temp) {
                    if(temp[key]?.type===ChannelType.GuildText || temp[key]?.type===ChannelType.GuildAnnouncement) {
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
                            new EmbedBuilder()
                                .setTimestamp()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({ size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
                                .setTitle('⛔️ Error')
                                .setColor('#ff0000')
                                .setDescription('You atleast need to use one of the options. If you do not want to use any of the options then use `/settings view` to view your settings.')
                        ]
                    })
                    return;
                }

                const check = await Settings.updateOne({_id: guildId}, {$set: subSettings});

                if(check.modifiedCount===0) {
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
            case 'role': {
                const embed = new EmbedBuilder()
                                .setTitle('Roles Settings')
                                .setColor('#00FFFF')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({ size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
                                .setTimestamp()
                                .setDescription('You are only allowed to use roles. If you put any other thing then the settings will be not accepted.')
                temp = {
                    farmer: interaction.options.getRole('farmer', false),
                    vacant: interaction.options.getRole('vacant', false),
                    occupied: interaction.options.getRole('occupied', false),
                    unavailable: interaction.options.getRole('unavailable', false)
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
                            new EmbedBuilder()
                                .setTimestamp()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({ size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
                                .setTitle('⛔️ Error')
                                .setColor('#ff0000')
                                .setDescription('You atleast need to use one of the options. If you do not want to use any of the options then use `/settings view` to view your settings.')
                        ]
                    })
                    return;
                }

                const check = await Settings.updateOne({_id: guildId}, {$set: subSettings});
                if(check.modifiedCount===0) {
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
                const guildSettings = await Settings.findOne({
                    _id: guildId
                })
                if(!guildSettings) {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTimestamp()
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({ size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
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

                const embeds = [
                    new EmbedBuilder()
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({ size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
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
                    new EmbedBuilder()
                        .setTimestamp()
                        .setColor('#00FFFF')
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({  size: 1024 })
                        })
                        .setTitle('Prices')
                        .setDescription('The price for each soul shard is **' + guildSettings.soul + ' coins.**')
                        .setFooter({
                            text: 'Page 2/3'
                        }),
                    new EmbedBuilder()
                        .setTimestamp()
                        .setColor('#00FFFF')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({ size: 1024})
                        })
                        .setTitle('Roles')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
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
                        new EmbedBuilder()
                            .setTimestamp()
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({ size: 1024})
                            })
                            .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 1024}) || '')
                            .setTitle('⛔️ Error')
                            .setColor('#ff0000')
                            .setDescription('This subcommand was not implemented yet. Please wait for it to be implemented. If you think this is a mistake please report it to the support server.')
                    ]
                });
            }
        }
    }
};

export default soulSettings;
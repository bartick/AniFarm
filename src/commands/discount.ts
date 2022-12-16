import { 
    SlashCommandBuilder, 
    SlashCommandIntegerOption, 
    SlashCommandRoleOption, 
    SlashCommandStringOption, 
    SlashCommandSubcommandBuilder 
} from "@discordjs/builders";
import { 
    GuildMember, 
    Message, 
    MessageEmbed 
} from "discord.js";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import { 
    SettingsType 
} from "../schema";
import {
    mongodb,
    relativeDate,
    paginate
} from './../utils';

const Settings = mongodb.models['settings'];

const discount: Command = {
    data: new SlashCommandBuilder()
        .setName('discount')
        .setDescription('Sets up discounts for you')
        .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('role')
            .setDescription('Sets Up role type discounts')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('type')
                .setDescription('Choose the type')
                .addChoice('add','add')
                .addChoice('remove', 'remove')
                .setRequired(true)
            )
            .addRoleOption((option: SlashCommandRoleOption) => 
                option.setName('name')
                .setDescription('Select a role to add')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('discount')
                .setDescription('Select a discount percentage')
            )
        )
        .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('order')
            .setDescription('Sets up order type discounts')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('type')
                .setDescription('Choose the type')
                .addChoice('add','add')
                .addChoice('remove', 'remove')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('number')
                .setDescription('Select number of order to get discount')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('discount')
                .setDescription('Select a discount percentage')
            )
        )
        .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('daily')
            .setDescription('Sets up daily discounts')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('time')
                .setDescription('Select number of orders to get discount')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('discount')
                .setDescription('Select a discount percentage')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('view')
            .setDescription('View the discounts the server provide')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('type')
                .setDescription('Type of discount')
                .setRequired(true)
                .addChoice('daily', 'daily')
                .addChoice('server', 'server')
            )
        )
        ,
    execute: async(interaction: CustomCommandInteraction) => {
        const subcommand: string = interaction.options.getSubcommand();

        if (!((interaction.member as GuildMember).permissions.has('MANAGE_GUILD')) && !(interaction.user.id==='707876147324518440') && !(subcommand==='view')) {
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

        const message = await interaction.deferReply({
            fetchReply: true
        }) as Message<boolean>;
        const guildId = interaction.guildId;
        const guildSettings: SettingsType | null = await Settings.findById(guildId);

        if (!guildSettings) {
            await interaction.editReply({
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
                        .setDescription('Guild Settings was not completed. Please ask a admin to complete the settings using /settings command.')
                ]
            });
            return;
        }

        switch (subcommand) {
            case 'role': {
                const type = interaction.options.getString('type', true);
                const role = interaction.options.getRole('name', true);
                const discount = interaction.options.getInteger('discount');
                switch(type) {
                    case 'add': {
                        let newRole = guildSettings.disRole
                        if (!discount) {
                            await interaction.editReply({
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
                                        .setDescription('Please provide a discount percentage.')
                                ]
                            });
                            return;
                        }
                        if (discount > 100 || discount < 0) {
                            await interaction.editReply({
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
                                        .setDescription('Discount percentage must be between 0 and 100.')
                                ]
                            });
                            return;
                        }
                        newRole.set(role.id, discount);
                        await Settings.updateOne({
                            _id: guildId,
                        }, {
                            $set: {
                                disRole: newRole
                            }
                        });
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTimestamp()
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                    })
                                    .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                    .setTitle('✅ Success')
                                    .setColor('#00FF00')
                                    .setDescription(`Discount role **${role.name}** has been added with __${discount}%__ discount.`)
                            ]
                        });
                        break;
                    }
                    case 'remove': {
                        let newRole = guildSettings.disRole
                        if (!newRole.has(role.id)) {
                            await interaction.editReply({
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
                                        .setDescription(`Discount role **${role.name}** does not exist.`)
                                ]
                            });
                            return;
                        }
                        newRole.delete(role.id);
                        await Settings.updateOne({
                            _id: guildId,
                        }, {
                            $set: {
                                disRole: newRole
                            }
                        });
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTimestamp()
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                    })
                                    .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                    .setTitle('✅ Success')
                                    .setColor('#00FF00')
                                    .setDescription(`Discount role **${role.name}** has been removed.`)
                            ]
                        });
                        break;
                    }
                    default: {
                        await interaction.editReply({
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
                                    .setDescription('Invalid type. Please choose from the list.')
                            ]
                        });
                    }
                }
                break;
            }
            case 'order': {
                const type = interaction.options.getString('type', true);
                const orderNumber = interaction.options.getInteger('number', true).toString();
                const discount = interaction.options.getInteger('discount');
                switch(type) {
                    case 'add': {
                        let newOrder = guildSettings.disOrder
                        if (!discount) {
                            await interaction.editReply({
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
                                        .setDescription('Please provide a discount percentage.')
                                ]
                            });
                            return;
                        }
                        if (discount > 100 || discount < 0) {
                            await interaction.editReply({
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
                                        .setDescription('Discount percentage must be between 0 and 100.')
                                ]
                            });
                            return;
                        }
                        newOrder.set(orderNumber, discount);
                        await Settings.updateOne({
                            _id: guildId,
                        }, {
                            $set: {
                                disOrder: newOrder
                            }
                        });
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTimestamp()
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                    })
                                    .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                    .setTitle('✅ Success')
                                    .setColor('#00FF00')
                                    .setDescription(`Order number **${orderNumber}** has been added with __${discount}%__ discount.`)
                            ]
                        });
                        break;
                    }
                    case 'remove': {
                        let newOrder = guildSettings.disOrder
                        if (!newOrder.has(orderNumber)) {
                            await interaction.editReply({
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
                                        .setDescription(`Order number **${orderNumber}** does not exist.`)
                                ]
                            });
                            return;
                        }
                        newOrder.delete(orderNumber);
                        await Settings.updateOne({
                            _id: guildId,
                        }, {
                            $set: {
                                disOrder: newOrder
                            }
                        });
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTimestamp()
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                    })
                                    .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                    .setTitle('✅ Success')
                                    .setColor('#00FF00')
                                    .setDescription(`Order number **${orderNumber}** has been removed.`)
                            ]
                        });
                        break;
                    }
                    default: {
                        await interaction.editReply({
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
                                    .setDescription('Invalid type. Please choose from the list.')
                            ]
                        });
                    }
                }
                break;
            }
            case 'daily': {
                const timeInputed = interaction.options.getString('time', true).trim();
                const discount = interaction.options.getInteger('discount', true);
                let timeLimit = Date.now();
                const timeObject: {
                    [key: string]: number
                } = {
                    s: 1000,
                    m: 60000,
                    h: 3600000,
                    d: 86400000,
                    w: 604800000,
                    y: 31536000000
                };
                const limit = (timeInputed.slice(timeInputed.length-1)).toLowerCase();
                const multiplier = timeInputed.slice(0, timeInputed.length-1);
                if (isNaN(parseInt(multiplier)) || 'smhdy'.indexOf(limit)===-1) {
                    await interaction.editReply({
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
                                .setDescription(`Your input ${timeInputed} is not a proper time. Please input a proper time next time.\n**Example of time:** 5h (This stands for 5 hours)\n\n__**Time possible:**\n1. Second (s)\n2.Minute (m)\n3. Hour (h)\n4. Day (d)\n5. Week (w)\n6. Year (y)`)
                        ]
                    });
                    return;
                };
                timeLimit = timeLimit + parseInt(multiplier)*timeObject[limit];
                const serverDis = {
                    next: timeLimit,
                    discount: discount
                }
                await Settings.updateOne(
                    {
                        _id: guildSettings._id
                    },
                    {
                        $set: {
                            disServer: serverDis
                        }
                    }
                )
                await interaction.editReply(`Flat discount of ${discount}% will end ${relativeDate.format(timeLimit)}`)

                break;
            }
            case 'view': {
                const disType = interaction.options.getString('type', true);
                if (disType==='daily') {
                    if (guildSettings.disServer.get('next')??0 > Date.now()) {
                        await interaction.editReply(`Flat discount of ${guildSettings.disServer.get('discount')}% will end ${relativeDate.format(guildSettings.disServer.get('next')??0)}`)
                    }
                    else {
                        await interaction.editReply(`Flat discount of ${guildSettings.disServer.get('discount')}% has ended ${relativeDate.format(guildSettings.disServer.get('next')??0)}`)
                    }
                    return;
                }
                const orderDis = Object.fromEntries((guildSettings.disOrder).entries());
                const roleDis = Object.fromEntries((guildSettings.disRole).entries());

                const embeds = [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setColor('#00ffff')
                        .setTitle('Role Discount'),
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setColor('#00ffff')
                        .setTitle('Order Discount')
                ];
                let description='';
                let pos = 1;
                for (const key in roleDis) {
                    description = description + `\n ${pos} | <@&${key}>  --  ${roleDis[key]}%`
                    pos++;
                }
                if (!(description==='')) embeds[0].setDescription(description);

                description='';
                pos = 1;
                for (const key in orderDis) {
                    description = description + `\n **${pos} |** ${key} Fodders  --  ${orderDis[key]}%`
                    pos++;
                }
                if (!(description==='')) embeds[1].setDescription(description);

                await paginate(interaction, embeds, message);

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
        }
    }
}

export default discount;
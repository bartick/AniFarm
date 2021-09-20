const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const settings = require('./../models/settings');
const relativeDate = require('./../utils/relateDate');
const paginate = require('./../utils/paginate');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('discount')
            .setDescription('Sets up discounts for you')
            .addSubcommand( subcommand => 
                subcommand.setName('role')
                .setDescription('Sets Up role type discounts')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('Choose the type')
                    .addChoice('add','add')
                    .addChoice('remove', 'remove')
                    .setRequired(true)
                )
                .addRoleOption(option => 
                    option.setName('name')
                    .setDescription('Select a role to add')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('discount')
                    .setDescription('Select a discount percentage')
                )
            )
            .addSubcommand( subcommand => 
                subcommand.setName('order')
                .setDescription('Sets up order type discounts')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('Choose the type')
                    .addChoice('add','add')
                    .addChoice('remove', 'remove')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('number')
                    .setDescription('Select number of order to get discount')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('discount')
                    .setDescription('Select a discount percentage')
                )
            )
            .addSubcommand( subcommand => 
                subcommand.setName('daily')
                .setDescription('Sets up daily discounts')
                .addStringOption(option => 
                    option.setName('time')
                    .setDescription('Select number of orders to get discount')
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('discount')
                    .setDescription('Select a discount percentage')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => 
                subcommand.setName('view')
                .setDescription('View the discounts the server provide')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('Type of discount')
                    .setRequired(true)
                    .addChoice('daily', 'daily')
                    .addChoice('server', 'server')
                )
            ),
    async execute(interaction) {
        if (interaction.guild===null) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setColor('RED')
                        .setTitle('⛔ Error')
                        .setDescription('You cannot use this command in DMs. Please go to a server to use this command.')
                ]
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if(!(interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) && !(interaction.user.id==='707876147324518440') && !(subcommand==='view')) {
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
        };
        await interaction.deferReply();
        const guildId = interaction.guildId;
        const guildSettings = await settings.findById(guildId);

        if (guildSettings===null) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTitle('⛔️ Error')
                        .setColor('RED')
                        .setDescription('Guild Settings was not completed. Please ask a admin to complete the settings using /settings command.')
                ]
            });
            return;
        };

        if (subcommand==='role') {
            const roleDis = guildSettings.disRole;
            const operation = interaction.options.getString('type');
            const role = interaction.options.getRole('name');
            const discount = interaction.options.getInteger('discount');
            if (operation==='remove') {
                if (roleDis.has(role.id)) {
                    roleDis.delete(role.id)
                    await settings.updateOne(
                        {
                            _id: guildSettings._id
                        },
                        {
                            $set: {
                                disRole: roleDis
                            }
                        }
                    )
                }
            }
            else {
                if (discount===null) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setTimestamp()
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setTitle('⛔️ Error')
                                .setColor('RED')
                                .setDescription('You need to provide the discount percentage you want to add to a certain role.')
                        ]
                    });
                    return;
                }
                roleDis.set(role.id, discount)
                await settings.updateOne(
                    {
                        _id: guildSettings._id
                    },
                    {
                        $set: {
                            disRole: roleDis
                        }
                    }
                )
            }
            let description = '';
            const embed = new MessageEmbed()
                .setTimestamp()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setColor('AQUA')
                .setTitle('Role Discount')
            const jsObject = Object.fromEntries(roleDis.entries());
            let pos = 1;
            for (const key in jsObject) {
                description = description + `\n ${pos} | <@&${key}>  --  ${jsObject[key]}%`;
                pos++;
            }
            if (!(description==='')) embed.setDescription(description);
            await interaction.editReply({
                embeds: [embed]
            })
        }
        else if(subcommand==='order') {
            const orderDis = guildSettings.disOrder;
            const operation = interaction.options.getString('type');
            const number = (interaction.options.getInteger('number')).toString();
            const discount = interaction.options.getInteger('discount');
            if (operation==='remove') {
                if (orderDis.has(number)) {
                    orderDis.delete(number)
                    await settings.updateOne(
                        {
                            _id: guildSettings._id
                        },
                        {
                            $set: {
                                disRole: orderDis
                            }
                        }
                    )
                }
            }
            else {
                if (discount===null) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setTimestamp()
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setTitle('⛔️ Error')
                                .setColor('RED')
                                .setDescription('You need to provide the discount percentage you want to add to a certain role.')
                        ]
                    });
                    return;
                }
                orderDis.set(number, discount)
                await settings.updateOne(
                    {
                        _id: guildSettings._id
                    },
                    {
                        $set: {
                            disOrder: orderDis
                        }
                    }
                )
            }
            let description = '';
            const embed = new MessageEmbed()
                .setTimestamp()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setColor('AQUA')
                .setTitle('Role Discount')
            const jsObject = Object.fromEntries(orderDis.entries());
            let pos = 1;
            for (const key in jsObject) {
                description = description + `\n **${pos} |** ${key} Fodders    --    ${jsObject[key]}%`;
                pos++;
            }
            if (!(description==='')) embed.setDescription(description);
            await interaction.editReply({
                embeds: [embed]
            });
        }
        else if(subcommand==='daily') {
            const timeInputed = interaction.options.getString('time').trim();
            const discount = interaction.options.getInteger('discount');
            let timeLimit = Date.now();
            const timeObject = {
                    s: 1000,
                    m: 60000,
                    h: 3600000,
                    d: 86400000,
                    w: 604800000,
                    y: 31536000000
                }
            const limit = (timeInputed.slice(timeInputed.length-1)).toLowerCase();
            const multiplier = timeInputed.slice(0, timeInputed.length-1);
            if (isNaN(parseInt(multiplier)) || 'smhdy'.indexOf(limit)===-1) {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTimestamp()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setTitle('⛔️ Error')
                            .setColor('RED')
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
            await settings.updateOne(
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
        }
        else {
            const disType = interaction.options.getString('type');
            if (disType==='daily') {
                if (guildSettings.disServer.next > Date.now()) {
                    await interaction.editReply(`Flat discount of ${guildSettings.disServer.get('discount')}% will end ${relativeDate.format(guildSettings.disServer.get('next'))}`)
                }
                else {
                    await interaction.editReply(`Flat discount of ${guildSettings.disServer.get('discount')}% has ended ${relativeDate.format(guildSettings.disServer.get('next'))}`)
                }
            }
            else {
                const orderDis = Object.fromEntries((guildSettings.disOrder).entries());
                const roleDis = Object.fromEntries((guildSettings.disRole).entries());
                const embeds = [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setColor('AQUA')
                        .setTitle('Role Discount'),
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setColor('AQUA')
                        .setTitle('Role Discount')
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

                await paginate(interaction, embeds, 0);

            }
        }
    }
};
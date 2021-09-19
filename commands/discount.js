const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const settings = require('./../models/settings');

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
                .addIntegerOption(option => 
                    option.setName('number')
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
        await interaction.reply("This Command in under work");
        return;
        //TODO: show what the farmer is farming

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
        await interaction.deferReply({
            ephemeral: true
        })
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
                if (roleDis.delete(role.id)) {
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
            for (const key of jsObject) {
                description = description + `\n ${pos} | <@&${key}>  --  ${jsObject[key]}`
            }
            if (description==='') description=null;
            embed.setDescription(description);
            await interaction.editReply({
                embeds: [embed]
            })
        }
        else if(subcommand==='order') {
            const orderDis = guildSettings.disOrder;
            const operation = interaction.options.getString('type');
            const role = interaction.options.getInteger('number');
            const discount = interaction.options.getInteger('discount');
        }
        else if(subcommand==='daily') {
            //TODO
        }
        else {
            //TODO
        }
    }
};
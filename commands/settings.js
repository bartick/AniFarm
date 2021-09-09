const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const settings = require('./../models/settings');

async function setDefault(guildId) {
    const first = new settings({
        _id: guildId
    });
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
        await interaction.deferReply({
            content: 'Thinking...',
            ephemeral: true
        });
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const guildSettings = await settings.findById(guildId);
        console.log(guildSettings.roles.vacant);
        if (guildSettings===null) {
            await setDefault(guildId);
            guildSettings = {
                _id: guildId,
                order: 0,
                pending: 0,
                status: 0,
                complete: 0,
                roles: {
                        vacant: 0,
                        occupied: 0,
                        unavailable: 0
                    },
                prices: []
            }
        };
        if (subcommand==='settings') {
            //TODO
        }
        else if (subcommand==='prices') {
            //TODO
        }
        else if (subcommand==='roles') {
            //TODO
        }
        else {
            const prices = ''
            const embed = [
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Settings')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .addField('Order Channel', guildSettings.order==0?'Not Yet Set':`<#${guildSettings.order}>`, false)
                    .addField('Pending Channel', guildSettings.pending==0?'Not Yet Set':`<#${guildSettings.pending}>`, false)
                    .addField('Status Channel', guildSettings.status==0?'Not Yet Set':`<#${guildSettings.status}>`, false)
                    .addField('Complete Channel', guildSettings.complete==0?'Not Yet Set':`<#${guildSettings.complete}>`, false),
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Prices')
                    .setDescription("```\n"+prices+"\n```"),
                new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTitle('Discounts')
            ]
        };
    }
};
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        // const guildSettings = await settings.findById(guildId);
        // console.log(guildSettings.roles.vacant);
        // if (guildSettings===null) {
        //     await setDefault(guildId);
        //     guildSettings = {
        //         _id: guildId,
        //         order: 0,
        //         pending: 0,
        //         status: 0,
        //         complete: 0,
        //         roles: {
        //                 vacant: 0,
        //                 occupied: 0,
        //                 unavailable: 0
        //             },
        //         prices: {}
        //     }
        // };
        if (subcommand==='guild') {
            const order = interaction.options.getChannel('order');
            const pending = interaction.options.getChannel('pending');
            const status = interaction.options.getChannel('status');
            const complete = interaction.options.getChannel('complete');
        }
        else if (subcommand==='prices') {
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
                        .setLabel('.')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('0')
                        .setLabel('0')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('up')
                        .setLabel('.')
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
            const priceRange = [];
            const cost = null;
            const place = 0;
            const index = 0;
            const collector = message.create.createMessageComponentCollector({ filter, time: 30000 });
            collector.on('collect', async i => {
                await i.deferUpdate();
                const id = i.setCustomId;
                const num = parseInt(id);
                if (isNaN(num)) {
                    if (id==='right') {
                        if (place===0) {
                            if (priceRange.length===0) return;
                            if (priceRange[place].length()===index+1) return;
                        }
                        else {
                            //TODO
                        }
                    }
                    else if(id=='left') {
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
                        if(index===0) {
                            priceRange.length===(place+1) ? priceRange[place]=num : priceRange.push(num);
                        }
                        else {
                            priceRange[place] = priceRange[place]*10 + num;
                        };
                    }
                    else {
                        cost===null? cost = toString(num) : cost[index] = toString(num)
                    };
                };
            })
        }
        else if (subcommand==='roles') {
            const farmer = interaction.options.getRole('farmer');
            const vacant = interaction.options.getRole('vacant');
            const occupied = interaction.options.getRole('occupied');
            const unavailable = interaction.options.getRole('unavailable');
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
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const settings = require('./../models/settings');

async function setDefault(firstRegister) {
    const first = new settings(firstRegister);
    await first.save();
}

function arrange(pos, options) {
    console.log(options);
    if (pos==='ascending') {
        return parseInt(options[0]) >= parseInt(options[1]) ? parseInt(options[1]+options[0]) : parseInt(options[0]+options[1]);
    }
    else {
        parseInt(options[0]) >= parseInt(options[1]) ? parseInt(options[0]+options[1]) : parseInt(options[1]+options[0]);
    };
};

async function priceSet(interaction) {
    //TODO
};

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
                        .setDescription('You do not have **Manage Server** permission to use this command. Please ask a user with the permission to use the command for you.')
                ]
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const guildSettings = await settings.findById(guildId);

        const subSettings = {};
        if (subcommand==='guild') {
            subSettings['order'] = interaction.options.getChannel('order');
            subSettings['pending'] = interaction.options.getChannel('pending');
            subSettings['status'] = interaction.options.getChannel('status');
            subSettings['complete'] = interaction.options.getChannel('complete');

            for (const key in subSettings) subSettings[key]===null ? delete subSettings[key] : subSettings[key] = subSettings[key].id;
            console.log(subSettings);
        }
        else if (subcommand==='prices') {
            subSettings['prices'] = await priceSet(interaction);
        }
        else if (subcommand==='roles') {
            subSettings['roles'] = {}
            subSettings['roles']['farmer'] = interaction.options.getRole('farmer');
            subSettings['roles']['vacant'] = interaction.options.getRole('vacant');
            subSettings['roles']['occupied'] = interaction.options.getRole('occupied');
            subSettings['roles']['unavailable'] = interaction.options.getRole('unavailable');

            for (const key in subSettings['roles']) subSettings['roles'][key]===null ? delete subSettings['roles'][key] : subSettings['roles'][key] =  subSettings['roles'][key].id;
            console.log(subSettings);
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
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
    const location = [
        new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('range')
                .setMinValues(2)
                .setMaxValues(2)
                .setPlaceholder('Select the location')
                .addOptions([
                    { label: '0', value: '0' },
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                    { label: '5', value: '5' },
                    { label: '6', value: '6' },
                    { label: '7', value: '7' },
                    { label: '8', value: '8' },
                    { label: '9', value: '9' }
                ])
        ),
        new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('confirm')
                .setDisabled(true)
                .setLabel('Confirm')
                .setEmoji('✅')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('Cancel')
                .setLabel('Cancel')
                .setEmoji('❌')
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
    const settings = {};
    let price = null;
    let priceRange = [1, null];
    let index = 1;

    const collector = message.createMessageComponentCollector({ filter, time: 60000 });
    collector.on('collect', async inter => {
        const id = inter.customId;
        let updated = false;
        if (id==='range') {
            if(index===1) {
                priceRange[1] = parseInt((inter.values).join(''));
                if (priceRange[1]>67) priceRange[1] = 67;
                if (priceRange[1]<priceRange[0]) {
                    priceRange[1] = null;
                    await inter.update({
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
                    updated = true;
                }
                else {
                    index++;
                    if(index==2) {
                        location[0].components[0].setMinValues(1);
                        location[0].components[0].setMaxValues(null);
                    }
                }
            }
            else {
                price = parseInt((inter.values).join(''));
                settings[price] = priceRange;
                priceRange = [priceRange[1]+1, null];
                price = null;
                index = 1;
                location[0].components[0].setMinValues(2);
                location[0].components[0].setMaxValues(2);
                if (settings[price]==67) {
                    location.shift();
                    location[0].components[0].setDisabled(false);
                };
            }
            if (!updated) {
                let description = '';
                let pos=0;
                for(const key in settings) {
                    description = description+`${pos+1} | ${settings[key][0]} to ${settings[key][1]}  →  ${key}\n`
                    pos++;
                }
                if(index===1) {
                    description = description+`# ${pos+1} | ${priceRange[0]} to "${priceRange[1]===null?'set':priceRange[1]}"  →  ${price}\n`
                }
                else {
                    description = description+`# ${pos+1} | ${priceRange[0]} to ${priceRange[1]}  →  "${price===null?'set':price}"\n`
                }
                embed.setDescription(`${'```js\n'}${description}${'\n```'}`);
                await inter.update({
                    embeds: [embed],
                    components: location
                });
            }
        }
        else if (id==='confirm') {
            await inter.deferUpdate();
            await inter.message.delete();
            console.log(settings);
            return settings;
        }
        else {
            await inter.deferUpdate()
            await inter.message.delete();
            collector.stop();
        }
    })
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

        if(!(interaction.user.permissions.has(Permissions.FLAGS.MANAGE_GUILD))) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTimestamp()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTitle('⛔️ Error')
                        .setDescription('You do not have **Manage Server** permission to use this connabs. Please ask a user with the permission to use the command for you.')
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

            for (const key in subSettings) subSettings[key] = subSettings[key]===null ? delete subSettings[key] : subSettings[key].id;
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

            for (const key in subSettings['roles']) subSettings['roles'][key] = subSettings['roles'][key]===null ? null : subSettings['roles'][key].id;
            console.log(subSettings);
        }
        else {
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
'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const profileConn = require('./../utils/profiledb');
const anifarm = profileConn.models['anifarm'];

async function badgeCarousel(profile, message, embeds) {
    let index = 0;
    const filter = (inter) => {
        if ((profile._id == inter.user.id) && ['left', 'love', 'right', 'close'].indexOf(inter.customId)>=0) return true;
        return inter.reply({
            content: "You cannot use this button",
            ephemeral: true
        })
    }
    const collector = message.createMessageComponentCollector({ filter, time: 30000});
    collector.on('collect', async (inter) => {
        const customeId = inter.customId;
        if (customeId === 'left') {
            index -= 1;
            if (index < 0) index =  0;
            else {
                await inter.update({
                    embeds: [embeds[index]]
                });
            }
        } else if (customeId === 'right') {
            index += 1;
            if (index >= embeds.length) index =  embeds.length - 1;
            else {
                await inter.update({
                    embeds: [embeds[index]]
                });
            }
        } else if (customeId === 'love') {
            await anifarm.updateOne({_id: profile._id}, {$set: {'setBadges': profile.badges[index]}});
            await inter.update({
                content: "You have successfully set this badge to show on your profile",
                components: []
            });
            return
        } else {
            await message.delete()
            return
        }
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Play with profile')
        .addSubcommand(subcommand => 
            subcommand.setName('register')
                .setDescription('Register for a profile')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('View a profile')
                .addUserOption( option =>
                    option.setName('user')
                        .setDescription('Please mention a user to get their profile.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit your profile')
                .addStringOption(option => 
                    option.setName('image')
                        .setDescription('Enter a image')
                )
                .addStringOption(option => 
                    option.setName('description')
                        .setDescription('Enter your profile description.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('badges')
                .setDescription('View your badges. And Choose your favourite.')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand==='register'){
            await interaction.deferReply()
            const newProfile = new anifarm({
                _id: interaction.user.id
            });
            await newProfile.save()
                    .then(async inter => {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('00FF00')
                                    .setTitle('🎉 Registered')
                                    .setTimestamp()
                                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setDescription(`**${interaction.user.tag}** you have successfully registered. You don't need to use this command any more. Enjoy all the other commands.`)
                            ]
                        })
                    }).catch(async err => {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('FF0000')
                                    .setTitle('⛔ Error')
                                    .setTimestamp()
                                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setDescription(`**${interaction.user.tag}** you have already registered. You don't need to use this command any more. Enjoy all the other commands.`)
                            ]
                        })
                    })
        } else if(subcommand==='badges'){
            await interaction.deferReply()
            await anifarm.findOne({_id: interaction.user.id}, async (err, profile) => {
                if(err){
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('FF0000')
                                .setTitle('⛔ Error')
                                .setTimestamp()
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setDescription(`**${interaction.user.tag}** you have not registered to use this command. Register with \`profile register\` to be able to use this command.`)
                        ]
                    })
                } else {
                    if (profile.badges.length === 0) {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('FF0000')
                                    .setTitle('⛔ Error')
                                    .setTimestamp()
                                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setDescription(`**${interaction.user.tag}** you don't have any badges to choose from.`)
                            ]
                        })
                    } else {
                        const embeds = [];
                        profile.badges.forEach(badge => {
                            const embed = new MessageEmbed()
                                .setColor('00FF00')
                                .setTitle('🪧 Badge')
                                .setTimestamp()
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setImage(badge)
                            embeds.push(embed);
                        });
                        const row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('left')
                                        .setLabel('<')
                                        .setStyle('PRIMARY'),
                                    new MessageButton()
                                        .setCustomId('love')
                                        .setLabel('❤')
                                        .setStyle('DANGER'),
                                    new MessageButton()
                                        .setCustomId('right')
                                        .setLabel('>')
                                        .setStyle('PRIMARY'),
                                    new MessageButton()
                                        .setCustomId('close')
                                        .setLabel('Close')
                                        .setStyle('SECONDARY')
                                )
                        const message = await interaction.editReply({
                            embeds: [embeds[0]],
                            components: [row],
                            fetchReply: true
                        });
                        await badgeCarousel(profile, message, embeds);
                    }
                }
            })
        } else if (subcommand==='view') {
            const userToFind = interaction.options.getUser('user') || interaction.user;
            const player = await anifarm.findById(userToFind.id);
            if (player===null) {
                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('FF0000')
                            .setTitle('⛔ Error')
                            .setTimestamp()
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setDescription(`${userToFind.tag} is not register to use this command. Please register before using this command.`)
                    ]
                });
                return;
            }
            const embed = new MessageEmbed()
                .setColor('00FFFF')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTitle(`🌾 ${userToFind.username} 👨‍🌾`)
                .addFields(
                    {name:'Total Order Farmed', value: String(player.farmed), inline: false},
                    {name: 'Total Fodders Ordered', value: String(player.ordered), inline: false},
                    {name: 'Speed', value: `${player.avg} cards/day`, inline: false},
                    {name: 'Rating', value: `${'★'.repeat(player.speed)}`, inline: false}
                )
                .setThumbnail(player.setBadges===""?interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}):player.setBadges)
                .setTimestamp()
            if (player.pstatus!=="" && player.pstatus!==null) {
                embed.setDescription(player.pstatus);
            };
            if (player.pimage!=="" && player.pstatus!==null) {
                embed.setImage(player.pimage);
            };
            await interaction.reply({
                embeds: [embed]
            });
        } else {
            const image = interaction.options.getString('image');
            const description = interaction.options.getString('description');
            if (image===null && description===null) {
                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('FF0000')
                            .setTitle('⛔ Error')
                            .setTimestamp()
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setDescription('Please either enter the image or the description to change it.')
                    ]
                });
                return;
            }

            let toUpdate = {}
            if (image!==null) {
                if (image.match(/\.(jpeg|jpg|gif|png)$/)===null || !(image.startsWith('https://'))) {
                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('FF0000')
                                .setTitle('⛔ Error')
                                .setTimestamp()
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setDescription('Your image link is not a direct image link. Please enter a direct image link.')
                        ]
                    });
                    return;
                }
                toUpdate['pimage'] = image;
            }
            if (description!==null) {
                toUpdate['pstatus'] = description;
            }
            const modified = await anifarm.updateOne({
                _id: interaction.user.id
            },
            {
                $set:toUpdate
            });
            if (modified.nModified===0) {
                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('FF0000')
                            .setTitle('⛔ Error')
                            .setTimestamp()
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setDescription(`${interaction.user.tag} is not register to use this command. Please register before using this command.`)
                    ]
                });
            } else {
                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('00FFFF')
                            .setTitle('🎉 Success')
                            .setTimestamp()
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setDescription('Your profile was successfully updated. Stay happy and healthy')
                    ]
                });
            }
        }
    },
};

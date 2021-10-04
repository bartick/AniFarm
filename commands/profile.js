'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const profileConn = require('./../utils/profiledb');
const anifarm = profileConn.models['anifarm'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Play with profile')
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
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand==='view') {
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
            if (player.pstatus!=="") {
                embed.setDescription(player.pstatus);
            };
            if (player.pimage!=="") {
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

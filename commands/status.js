'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const conn = require('./../utils/mongodb');
const settings = conn.models['settings'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Change your role according to the status of farming you are doing.')
        .addStringOption( option => 
            option.setName('name')
            .setDescription('Name of the role')
            .addChoice('vacant', 'vacant')
            .addChoice('occupied', 'occupied')
            .addChoice('unavailable', 'unavailable')
            .setRequired(true)
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
        await interaction.deferReply({
            ephemeral: true
        })
        const guildSettings = await settings.findById(interaction.guild.id);
        if (guildSettings===null || guildSettings.farmer==='0') {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('The settings was not finished. Please ask a admin to complete the settings.')
                ]
            });
            return;
        };
        if (!(interaction.member.roles.cache.has(guildSettings.farmer))) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('You are not a farmer of this server. So you cannot use this command. Please take some rest or use this command in the server you can (a server where you are a farmer)')
                ]
            });
            return;
        }
        const choice = interaction.options.getString('name');
        if (guildSettings[choice]==='0') {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('This server dosen\'t have this role. Please try other role status if that fits your need.')
                ]
            })
        } else {
            if (interaction.member.roles.cache.has(guildSettings[choice])) {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('You already have this role. No need to re-assign it.\nHave a nice day.')
                    ]
                })
            }
            else {
                try {
                    let description = '+ <@&'+guildSettings[choice]+'>\n';
                    await interaction.member.roles.add(guildSettings[choice]);
                    let status = ['vacant', 'occupied', 'unavailable'].filter((ele) => {
                        return ele!=choice
                    });
                    for (const stat of status) {
                        if (interaction.member.roles.cache.has(guildSettings[stat])) {
                            await interaction.member.roles.remove(guildSettings[stat]);
                            description = description + '\n-  <@&'+guildSettings[stat]+'>';
                        }
                    }
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('AQUA')
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setTimestamp()
                            .setTitle('Role Effected')
                            .setDescription(description)
                        ]
                    })
                } catch(err) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('RED')
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setTimestamp()
                            .setTitle('⛔️ Error')
                            .setDescription('I do not have permission to change role or assign role. Please ask a admin to fix the issue before using this command.')
                        ]
                    })
                }
            }
        }
    }
}
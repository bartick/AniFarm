'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave a guild you hate.')
        .addStringOption( option =>
            option.setName('guildid')
                .setDescription('Input the guildId.')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });
        const guildId = interaction.options.getString('guildid')
        const guild = interaction.client.guilds.cache.get(guildId);
        if (guild===undefined) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('GREEN')
                        .setTimestamp()
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTitle('⛔ Error')
                        .setDescription(`I am not in any guild with id __${guildId}__`)
                ]
            });
            return;
        }
        if(!guild.available) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('GREEN')
                        .setTimestamp()
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTitle('⛔ Error')
                        .setDescription(`Currently the guild **${guild.name}** is unavailable. Please try again when it will be available`)
                ]
            });
            return;
        }
        await guild.leave();
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('GREEN')
                    .setTimestamp()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setThumbnail(guild.icon)
                    .setTitle('🎉 Success')
                    .setDescription(`Successfully left **${guild.name}**. 😈`)
            ]
        })
    }
};
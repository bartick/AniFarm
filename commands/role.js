const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const settings = require('./../models/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Change your role according to the status of farming you are doing.')
        .addStringOption( option => 
            option.setName('name')
            .setDescription('Name of the role')
            .addChoice('vacant', 'vacant')
            .addChoice('occupied', 'occupied')
            .addChoice('unavailable', 'unavailable')
        ),
    async execute(interaction) {
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
        if (!(interaction.member.roles.cache.has(gameOrder.farmer))) {
            await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('You cannot accept orders from this server as you are not a farmer of this server.\nThank You...')
                ]
            });
            return;
        }
        const choice = interaction.options.getString('name');
        if (guildSettings[choice]==='0') {
            //TODO
        } else {
            //TODO
        }
    }
}
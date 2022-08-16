import {
    SlashCommandBuilder
} from '@discordjs/builders';
import {
    GuildMember,
    MessageEmbed,
} from 'discord.js';
import {
    Command,
    CustomCommandInteraction
} from './../interfaces';
import {
    mongodb
} from './../utils';

const Settings = mongodb.models['settings'];

const status: Command = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Changes your current farming status')
        .addStringOption( option => 
            option.setName('name')
            .setDescription('Name of the role')
            .addChoice('vacant', 'vacant')
            .addChoice('occupied', 'occupied')
            .addChoice('unavailable', 'unavailable')
            .setRequired(true)
        ),
    execute: async (interaction: CustomCommandInteraction) => {
        if(!interaction.guild?.me?.permissions.has('MANAGE_ROLES') && !!interaction.guild?.me?.permissions.has('ADMINISTRATOR')) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})  
                        })
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('I don\'t have the permission to manage roles. Please ask a admin to give me the permission.')
                ]
            });
            return;
        }

        const name = interaction.options.getString('name', true);
        await interaction.deferReply({
            ephemeral: true
        })
        const guildSettings = await Settings.findById(interaction.guild?.id || '0');
        if (guildSettings===null || guildSettings.farmer==='0') {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('The settings was not finished. Please ask a admin to complete the settings.')
                ]
            });
            return;
        };

        const author: GuildMember = interaction.member as GuildMember

        if (!(author.roles.cache.has(guildSettings.farmer))) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('You are not a farmer of this server. So you cannot use this command. Please take some rest or use this command in the server you can (a server where you are a farmer)')
                ]
            });
            return;
        }

        if (guildSettings[name]==='0') {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('This server dosen\'t have this role. Please try other role status if that fits your need.')
                ]
            });
            return;
        }

        const role = await interaction.guild?.roles.fetch(guildSettings[name]);
        if(!role) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setTimestamp()
                        .setTitle('⛔️ Error')
                        .setDescription('This server dosen\'t have this role. Please try other role status if that fits your need.')
                ]
            });
            return;
        }

        let description = "";

        if(guildSettings['vacant']!="0" && name!=="vacant"){
            if(author.roles.cache.has(guildSettings['vacant'])) {
                const vacantRole = await interaction.guild?.roles.fetch(guildSettings['vacant']);
                if (vacantRole) {
                    await author.roles.remove(vacantRole);
                    description += '\n-  <@&'+guildSettings['vacant']+'>';
                }
            }
        }
        if(guildSettings['occupied']!="0" && name!=="occupied"){
            if(author.roles.cache.has(guildSettings['occupied'])) {
                const occupiedRole = await interaction.guild?.roles.fetch(guildSettings['occupied']);
                if (occupiedRole) {
                    await author.roles.remove(occupiedRole);
                    description += '\n-  <@&'+guildSettings['occupied']+'>';
                }
            }
        }
        if(guildSettings['unavailable']!="0" && name!=="unavailable"){
            if(author.roles.cache.has(guildSettings['unavailable'])) {
                const unavailableRole = await interaction.guild?.roles.fetch(guildSettings['unavailable']);
                if (unavailableRole) {
                    await author.roles.remove(unavailableRole);
                    description += '\n-  <@&'+guildSettings['unavailable']+'>';
                }
            }
        }

        await author.roles.add(role);
        description = '+  <@&'+role.id+'>' + description;
        
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setColor('#00ff00')
                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                .setAuthor({
                    name: interaction.user.username, 
                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                })
                .setTimestamp()
                .setTitle('Role Effected')
                .setDescription(description)
            ]
        })

    }
}

export default status;
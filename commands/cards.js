'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqldb = require('./../utils/sqlite');

async function expcalculator(exp) {
    return sqldb.prepare('SELECT Exp FROM Expcards WHERE Level Between ? AND ?').all(exp[0], exp[1]);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('Get the number of cards needed to reach from level x to level y')
        .addStringOption(option => 
            option.setName('levels')
            .setDescription('Provide the levels to get information')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });
        let exerience=0;
        const levels = interaction.options.getString('levels').trim().split(/\s+/);
        if(levels.length==2 && isNaN(levels[0]) && !(isNaN(levels[1]))) {
            const starting = levels[0].trim().split(/\,+/);
            for (const start of starting) {
                if (isNaN(start)) {
                    if (start==='') continue;
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setTimestamp()
                                .setColor('RED')
                                .setTitle('⛔ Error')
                                .setDescription('Please provide valid levels.\nI can see one of the starting level is not a integer.')
                        ]
                    });
                    return;
                }
                const data = await expcalculator([parseInt(start)+1, parseInt(levels[1])])
                for (const exp of data) {
                    exerience=exp.Exp+exerience
                };
            };
        }
        else {
            if (levels.length%2 !== 0) {
                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                            .setTimestamp()
                            .setColor('RED')
                            .setTitle('⛔ Error')
                            .setDescription('Please provide valid levels.\nI can see the starting level but not the ending level.')
                    ]
                });
                return;
            }
            else {
                for (let i=0; i<levels.length; i+=2) {
                    if (levels[i]<=0 && levels[i+1]>60) {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                    .setTimestamp()
                                    .setColor('RED')
                                    .setTitle('⛔ Error')
                                    .setDescription('Please provide valid levels.\nStarting level cannot be less than 1 and required cannot be more than 60.')
                            ]
                        });
                        return;
                    }
                    const data = await expcalculator([parseInt(levels[i])+1,parseInt(levels[i+1])])
                    for (const exp of data) {
                        exerience=exp.Exp+exerience
                    };
                };
            }
        }

        /**
         * 3x Multiplier
         * Common - 300
         * Uncommon - 600
         * Rare - 900
         * 
         * No Multiplier
         * Common - 100
         * Uncommon - 200
         * Rare - 300
         */

         const card_exp = [
                parseInt(exerience/300) + ((exerience%300)>0 ? 1 : 0),
                parseInt(exerience/600) + ((exerience%600)>0 ? 1 : 0),
                parseInt(exerience/900) + ((exerience%900)>0 ? 1 : 0),
                parseInt(exerience/100) + ((exerience%100)>0 ? 1 : 0),
                parseInt(exerience/200) + ((exerience%200)>0 ? 1 : 0),
                parseInt(exerience/300) + ((exerience%300)>0 ? 1 : 0)
            ];
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTimestamp()
                    .setColor('AQUA')
                    .setTitle('ENCHANTMENT')
                    .setDescription(`__**3x Multiplier (Same Cards)**__\n» ${card_exp[0]} Common Cards\n» ${card_exp[1]} Uncommon Cards\n» ${card_exp[2]} Rare Cards\n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n__**Non Multiplier (Different Cards)**__\n» ${card_exp[3]} Common Cards\n» ${card_exp[4]} Uncommon Cards\n» ${card_exp[5]} Rare Cards`)
                    .setFooter(`Total Exp: ${exerience}`)
            ]
        })
    }
}
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { Command } from "./../interfaces";
import { getExperiences } from "../logic";

const cards: Command = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('Get the number of cards needed to reach from level x to level y')
        .addStringOption((option: SlashCommandStringOption) => 
            option
                .setName('levels')
                .setDescription('Provide the levels to get information')
                .setRequired(true)
        ),
    execute: async(interaction: CommandInteraction) => {
        await interaction.deferReply();
        const levels: Array<number> = interaction.options.getString('levels', true).trim().split(/\s+/).map(level => parseInt(level.trim()));
        let exerience: number = 0;
        if (levels.length%2 !== 0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle('⛔️ Error')
                        .setDescription('If you are providing the starting level then please also provide the ending level.')
                        .setColor('RED')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')

                ]
            });
            return;
        } else {
            for(let i=0;i<levels.length;i+=2){
                if (levels[i]<=0 || levels[i+1]>60 || levels[i]>=levels[i+1]) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.username, 
                                    iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                                })
                                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                                .setTimestamp()
                                .setColor('RED')
                                .setTitle('⛔ Error')
                                .setDescription('Please provide valid levels.\nStarting level cannot be less than 1 and required cannot be more than 60.\nAnd starting level must be smaller than ending level.')
                        ]
                    });
                    return;
                }
                exerience += await getExperiences([levels[i]+1, levels[i+1]])
                    .then(exp => {
                        return exp.reduce((acc, curr) => acc + curr.Exp, 0);
                    });
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

         const card_exp: Array<number> = [
                Math.trunc(exerience/300) + ((exerience%300)>0 ? 1 : 0),
                Math.trunc(exerience/600) + ((exerience%600)>0 ? 1 : 0),
                Math.trunc(exerience/900) + ((exerience%900)>0 ? 1 : 0),
                Math.trunc(exerience/100) + ((exerience%100)>0 ? 1 : 0),
                Math.trunc(exerience/200) + ((exerience%200)>0 ? 1 : 0),
                Math.trunc(exerience/300) + ((exerience%300)>0 ? 1 : 0)
            ];
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.username, 
                        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                    })
                    .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                    .setTimestamp()
                    .setColor('AQUA')
                    .setTitle('ENCHANTMENT')
                    .setDescription(`__**3x Multiplier (Same Cards)**__\n» ${card_exp[0]} Common Cards\n» ${card_exp[1]} Uncommon Cards\n» ${card_exp[2]} Rare Cards\n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n__**Non Multiplier (Different Cards)**__\n» ${card_exp[3]} Common Cards\n» ${card_exp[4]} Uncommon Cards\n» ${card_exp[5]} Rare Cards`)
                    .setFooter({
                        text: `Total Exp: ${exerience}`
                    })
            ]
        })
    }
};


export default cards;
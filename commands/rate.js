'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const profileConn = require('./../utils/profiledb');
const anifarm = profileConn.models['anifarm'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription('Rate a farmer according to his/her performance')
        .addUserOption(option => 
            option.setName('farmer')
                .setDescription('Please mention a farmer to rate.')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply();
        const farmer = interaction.options.getUser('farmer');

        // if(interaction.user===farmer){
        //     await interaction.editReply('You cannot rate yourself!');
        //     return;
        // }

        const farmerUser = await anifarm.findById(farmer.id);
        if (!farmerUser) {
            await interaction.editReply('You have not registered a farmer yet. Please use `register` to register a farmer.');
            return;
        };

        if (interaction.user.id in farmerUser.ratable) {
            await interaction.editReply('You cannot rated this farmer.');
            return;
        };

        let speed = [0, 0]

        for (const [key, value] of farmerUser.rating.entries()) {
            if (interaction.user.id in value) {
                await interaction.editReply(`You have already rated the farmer with ${key} stars.`);
                return;
            }
            speed[0] += key*value.length;
            speed[1] += value.length;
        };

        const embed = new MessageEmbed()
            .setTitle(`Rate your a farmer`)
            .setThumbnail(farmer.displayAvatarURL())
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
            .setTimestamp()
            .setColor('AQUA')
            .setDescription(`If you are satisfied with ${farmer.username}\'s performance, please rate him/her from 1 to 10.\n\n**1** - Not satisfied\n**5** - Fully Satisfied`)
        
        const ratingButtons = [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('1')
                        .setLabel('1')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('2')
                        .setLabel('2')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('3')
                        .setLabel('3')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('4')
                        .setLabel('4')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('5')
                        .setLabel('5')
                        .setStyle('PRIMARY')
                )
        ]
        await interaction.editReply({
            embeds: [embed],
            components: ratingButtons
        });

        const message  = await interaction.fetchReply();

        const filter = (inter) => {
            if (interaction.user.id === inter.user.id) return true;
            return inter.reply({
                content: "You cannot use this button",
                ephemeral: true
            })
        };

        const collector = message.createMessageComponentCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', async (inter) => {
            const id = inter.customId;
            await inter.reply({
                content: `You rated **${farmer.username}** as ${id}/5. Thank you for your feedback!`,
                ephemeral: true
            });
            let updateRating = farmerUser.rating.get(id);
            updateRating.push(inter.user.id);
            farmerUser.rating.set(id, updateRating);
            console.log(farmerUser.rating.entries());
            speed[0] += id;
            speed[1] += 1;
            const avg = speed[0]/speed[1];

            await anifarm.updateOne({
                _id: farmer.id
            }, {
                $set: {
                    rating: rating,
                    speed: avg
                }
            });
        });
    },
};
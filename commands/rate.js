'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const profileConn = require('./../utils/profiledb');
const anifarm = profileConn.models['anifarm'];

async function confirm(params) {
    const embed = new MessageEmbed()
            .setColor('AQUA')
            .setDescription(`Are you sure you want to rate **${params.farmer.tag}** with ${'★'.repeat(params.rate)}`)
            .setTitle('Please Confirm.')
            .setTimestamp()
            .setAuthor(params.user.username, params.user.displayAvatarURL())
    const confirmButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('confirm')
                        .setEmoji('✅')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('cancel')
                        .setEmoji('❌')
                        .setStyle('SECONDARY')
                )
    await params.interaction.reply({
        embeds: [embed],
        components: [confirmButtons]
    });

    const message = await params.interaction.fetchReply();

    const filter = (inter) => {
        if (params.interaction.user.id === inter.user.id) return true;
        return inter.reply({
            content: "You cannot use this button",
            ephemeral: true
        })
    };

    const collector = message.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async (inter) => {
        const id = inter.customId;
        try {
            await inter.message.delete();
        } catch (error) {
            // SKIP
        }
        if (id==='confirm') {
            await inter.reply({
                content: `You rated **${params.farmer.username}** as ${params.rate}/5. Thank you for your feedback!`,
                ephemeral: true
            });
            let updateRating = params.farmerUser.rating.get(params.rate);
            updateRating.push(inter.user.id);
            params.farmerUser.rating.set(params.rate, updateRating);
            params.speed[0] += parseInt(params.rate);
            params.speed[1] += 1;
            const avg = parseInt(params.speed[0]/params.speed[1]);
            await anifarm.updateOne({
                _id: params.farmer.id
            }, {
                $set: {
                    rating: params.farmerUser.rating,
                    speed: avg
                }
            });
        };
    });

   
    
}

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

        if(interaction.user===farmer){
            await interaction.editReply('You cannot rate yourself!');
            return;
        }

        const farmerUser = await anifarm.findById(farmer.id);
        if (!farmerUser) {
            await interaction.editReply('You have not registered a farmer yet. Please use `register` to register a farmer.');
            return;
        };

        let speed = [0, 0]

        for (const [key, value] of farmerUser.rating.entries()) {
            if (value.includes(interaction.user.id)) {
                await interaction.editReply(`You have already rated the farmer with ${key} stars.`);
                return;
            }
            speed[0] += parseInt(key)*parseInt(value.length);
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
            
            try {
                await inter.message.delete();
            } catch (error) {
                // SKIP
            }

            try {
                await confirm({
                    farmer: farmer,
                    user: inter.user,
                    rate: id,
                    interaction: inter,
                    farmerUser: farmerUser,
                    speed: speed
                });
            } catch (error) {
                // SKIP
            }
        });
    },
};
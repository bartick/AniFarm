'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join a guild with less then 100 members.')
        .addStringOption( option =>
            option.setName('guildid')
                .setDescription('Input the guildId.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const guildId = interaction.options.getString('guildid');
        (interaction.client.power).push(guildId);
        await interaction.reply({
            content: `Now I will join the guild with id **${guildId}**`
        });
    }
};
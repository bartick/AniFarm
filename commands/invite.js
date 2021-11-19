'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
            .setName('invite')
            .setDescription('Invite me'),
    async execute(interaction) {
        const invite = 'https://discord.com/api/oauth2/authorize?client_id=816544600118132747&permissions=137707899968&scope=bot%20applications.commands';
        const support = 'https://discord.gg/7ZDqbSSe2k';
        await interaction.reply({
            content: `To invite me to your server use the link below \n${invite} \nIf you have any problem setting up the bot you can join my support server for help.\n${support}`
        });
    }
};
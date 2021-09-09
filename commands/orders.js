const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
            .setName('orders')
            .setDescription('Shows all your current order'),
    async execute(interaction) {
        //TODO: show a users total order
    }
};
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        const memberCount = guild.memberCount;
        const guildOwner =  await guild.client.users.fetch(guild.ownerId);

        const embed = new MessageEmbed()
                .setAuthor(guild.client.user.username, guild.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp()

        if (memberCount<=50) {
            embed
                .setTitle('⛔️ Error')
                .setDescription(`Sorry your server dosen\'t meet the requirement of ${'`'}50${'`'} members you need ${51-memberCount} more members.\nPlease try again when you have meat the requirement.`)
                .setColor('RED');
            await guild.leave()
        }
        else {
            embed
                .setTitle('Thank You! 🎉')
                .setDescription(`You have successfuly invited me to your server **${guild.name}**.\nI only use slash commands to interact with users. Also I will recomend you to complete the settings in order for me to work in your server`)
                .setColor('GREEN');
        }
        try {
            await guildOwner.send({
                embeds: [embed]
            });
        } catch (err) {
            console.error(err);
        };
    }
};
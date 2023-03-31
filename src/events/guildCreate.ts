import { EmbedBuilder } from 'discord.js';
import { Event, CustomGuild } from '../interfaces';

const guildCreate: Event = {
    name: 'guildCreate',
    async execute(guild: CustomGuild) {
        const memberCount = guild.memberCount;
        const guildOwner =  await guild.client.users.fetch(guild.ownerId)

        const embed = new EmbedBuilder()
                .setAuthor({
                    name: guild?.client?.user?.username || 'User',
                    iconURL: guild?.client?.user?.displayAvatarURL({ size: 1024})
                })
                .setTimestamp();
        
        let leave = false;

        if (memberCount<=50 && (guild.client.power || []).indexOf(guild.id)==-1) {
            embed
                .setTitle('⛔️ Error')
                .setDescription(`Sorry your server dosen\'t meet the requirement of ${'`'}50${'`'} members you need ${51-memberCount} more members.\nPlease try again when you have meat the requirement.`)
                .setColor('#FF0000');
            leave = true;
        }
        else {
            if ((guild.client.power || []).indexOf(guild.id)>=0) {
                (guild.client.power || []).filter((ele: string) => {
                    return ele!=guild.id;
                });
            };
            embed
                .setTitle('Thank You! 🎉')
                .setDescription(`You have successfuly invited me to your server **${guild.name}**.\nI only use slash commands to interact with users. Also I will recomend you to complete the settings in order for me to work in your server`)
                .setColor('#00FF00');
        }
        await guildOwner.send({
            embeds: [embed]
        }).catch((err: Error) => {
            console.error(err);
        });
        if (leave) {
            await guild.leave();
        }
    }
};

export default guildCreate;
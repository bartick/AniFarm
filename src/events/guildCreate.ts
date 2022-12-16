import { MessageEmbed } from 'discord.js';
import { Event, CustomGuild } from '../interfaces';

const guildCreate: Event = {
    name: 'guildCreate',
    async execute(guild: CustomGuild) {
        const memberCount = guild.memberCount;
        const guildOwner =  await guild.client.users.fetch(guild.ownerId)

        const embed = new MessageEmbed()
                .setAuthor({
                    name: guild?.client?.user?.username || 'User',
                    iconURL: guild?.client?.user?.displayAvatarURL({dynamic: true, size: 1024})
                })
                .setTimestamp();
        
        let leave = false;

        if (memberCount<=50 && (guild.client.power || []).indexOf(guild.id)==-1) {
            embed
                .setTitle('⛔️ Error')
                .setDescription(`Sorry your server dosen\'t meet the requirement of ${'`'}50${'`'} members you need ${51-memberCount} more members.\nPlease try again when you have meat the requirement.`)
                .setColor('RED');
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
                .setColor('GREEN');
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
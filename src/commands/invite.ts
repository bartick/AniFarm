import { 
    SlashCommandBuilder 
} from '@discordjs/builders';
import { 
    Command, 
    CustomCommandInteraction 
} from './../interfaces';

const invite: Command = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite me to your server!'),
    async execute(interaction: CustomCommandInteraction) {
        await interaction.reply({
            content: `
Hello summoner, Welcome to **AniFarm**. 
If you are wondering what is this bot for? Or what are the application of this bot? 
Then let me introduce anifarm properly. It is a bot created for the purpose of making farming easy in anigames as it handles everything related to anigame farming .
Its some functions are to design a proper rate of list for farming, make status of farmer clear, reduce the manual work of making invoice, make customer easy to contact farmer, show availability of vacant farmers  and more. It also provides benefit for server as they can do daily discount with commands and bot will adjust the prize and status according to it. It also follow Discord TOS and fall under slash command system.Anifarm is here to make farming easy for every server.

To invite me to your server use the link below 
https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user?.id}&permissions=137707899968&scope=bot%20applications.commands 
If you have any problem setting up the bot you can join my support server for help.
https://discord.gg/zQw7smpXFA
            `
        });
    },
};

export default invite;
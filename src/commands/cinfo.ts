import { CommandInteraction, MessageEmbed, User } from 'discord.js';
import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders';
import { Command, Card, LocationFloor, ClientUser } from './../interfaces';
import { paginate, getCard, getLocationFloor } from '../utils';


function statz_formula(R: number, Evo: number, Lv: number): number {
    /**R = 1.6 (R) / 1.8 (SR) / 2(UR)
       Evo = 1-3
       LV = R(1+0.005LV)(1+0.15(EVO-1))*/
    return R*(1+0.005*Lv)*(1+0.15*(Evo-1));
}

async function displayCard(card: Card, user: User, client: ClientUser): Promise<Array<MessageEmbed>> {
    const locfl: LocationFloor = await getLocationFloor(card.SERIES);
    const location: number | string = card.LOCATION===0 ? 'These cards are not found in any Floor' : card.LOCATION
    const floor: number | string = card.LOCATION===0 ? '~~Events~~, Lottery' : `${card.FLOOR}, ${card.FLOOR+locfl.FLOORS}, ${(locfl.FLOORS*2)+card.FLOOR}`
    const sr: Array<number> = [
        statz_formula(1.8,1,50),
        statz_formula(1.8,2,50),
        statz_formula(1.8,3,50)
    ]
    const ur: Array<number> = [
        statz_formula(2,1,60),
        statz_formula(2,2,60),
        statz_formula(2,3,60)
    ]

    const embeds: Array<MessageEmbed> = [
        new MessageEmbed()
            .setColor('#00FFFF')
            .setAuthor({
                name: user.username, 
                iconURL: user.displayAvatarURL({dynamic: true, size: 1024})
            })
            .setTitle(`**${card.NAME}**`)
            .setDescription(`**Card Series:** ${card.SERIES}\n**Type:** ${card.TYPE}\n**Hp:** ${card.HP}\n**Atk:** ${card.ATK}\n**Def:** ${card.DEF}\n**Speed:** ${card.SPEED}`)
            .addField('Location 🗺', `**Area:** ${location}\n**FLOOR:** ${floor}`, false)
            .addField('Talent', `${card.EMOJI} ${card.BASETALENT}`, false)
            .setImage(card.PICTURE)
            .setThumbnail(client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
            .setFooter({
                text: `Page 1/3 • ${card.FOOTER} | ID: ${card.ID}`
            })
            .setTimestamp(),
        new MessageEmbed()
            .setColor('#00FFFF')
            .setAuthor({
                name: user.username, 
                iconURL: user.displayAvatarURL({dynamic: true, size: 1024})
            })
            .setImage(card.PICTURE)
            .setThumbnail(client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
            .setTitle(`**${card.NAME}**`)
            .addField('SR Evo 1 ', `**Hp:** ${Math.trunc(card.HP*sr[0])}\n**Atk:** ${Math.trunc(card.ATK*sr[0])}\n**Def:** ${Math.trunc(card.DEF*sr[0])}\n**Speed:** ${Math.trunc(card.SPEED*sr[0])}`, true)
            .addField('SR Evo 2 ', `**Hp:** ${Math.trunc(card.HP*sr[1])}\n**Atk:** ${Math.trunc(card.ATK*sr[1])}\n**Def:** ${Math.trunc(card.DEF*sr[1])}\n**Speed:** ${Math.trunc(card.SPEED*sr[1])}`, true)
            .addField('SR Evo 3 ', `**Hp:** ${Math.trunc(card.HP*sr[2])}\n**Atk:** ${Math.trunc(card.ATK*sr[2])}\n**Def:** ${Math.trunc(card.DEF*sr[2])}\n**Speed:** ${Math.trunc(card.SPEED*sr[2])}`, true)
            .addField('SR Talent', `${card.EMOJI} ${card.SRTALENT}`, false)
            .setFooter({
                text: `Page 2/3 • ${card.FOOTER} | ID: ${card.ID}`
            })
            .setTimestamp(),
        new MessageEmbed()
        .setColor('#00FFFF')
        .setAuthor({
            name: user.username, 
            iconURL: user.displayAvatarURL({dynamic: true, size: 1024})
        })
        .setImage(card.PICTURE)
        .setThumbnail(client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
        .setTitle(`**${card.NAME}**`)
        .addField('UR Evo 1 ', `**Hp:** ${Math.trunc(card.HP*ur[0])}\n**Atk:** ${Math.trunc(card.ATK*ur[0])}\n**Def:** ${Math.trunc(card.DEF*ur[0])}\n**Speed:** ${Math.trunc(card.SPEED*ur[0])}`, true)
        .addField('UR Evo 2 ', `**Hp:** ${Math.trunc(card.HP*ur[1])}\n**Atk:** ${Math.trunc(card.ATK*ur[1])}\n**Def:** ${Math.trunc(card.DEF*ur[1])}\n**Speed:** ${Math.trunc(card.SPEED*ur[1])}`, true)
        .addField('UR Evo 3 ', `**Hp:** ${Math.trunc(card.HP*ur[2])}\n**Atk:** ${Math.trunc(card.ATK*ur[2])}\n**Def:** ${Math.trunc(card.DEF*ur[2])}\n**Speed:** ${Math.trunc(card.SPEED*ur[2])}`, true)
        .addField('UR Talent', `${card.EMOJI} ${card.URTALENT}`, false)
        .setFooter({
            text: `Page 3/3 • ${card.FOOTER} | ID: ${card.ID}`
        })
        .setTimestamp()
    ];
    return embeds;
}

const cinfo: Command = {
    data: new SlashCommandBuilder()
        .setName('cinfo')
        .setDescription('Gets a proper card info about your favourite AniGame card')
        .addStringOption((option: SlashCommandStringOption) => 
            option
                .setName('name')
                .setDescription('Name of the card')
                .setRequired(true)
            ),
    execute: async(interaction: CommandInteraction) => {
        const name = interaction.options.getString('name', true).trim();
        getCard(name)
        .then(async (card: Card) => {
            const embeds: Array<MessageEmbed> = await displayCard(card, interaction.user, interaction.client);
            await paginate(interaction, embeds);
        }).catch(async (err: Error) => {
            const embed: MessageEmbed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('⛔ Error')
                    .setDescription(err.message)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                    })
                    .setTimestamp();
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        })
    }

}

export default cinfo;


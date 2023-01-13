import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageAttachment, Message } from 'discord.js';
import { paginate, sqldb } from './../utils'
import Canvas from 'canvas';
import { Card, Command, CustomCommandInteraction } from '../interfaces';

function statz_formula(R: number, Evo: number, Lv: number): number {
    /**R = 1.6 (R) / 1.8 (SR) / 2(UR)
       Evo = 1-3
       LV = R(1+0.005LV)(1+0.15(EVO-1))*/
    return R*(1+0.005*Lv)*(1+0.15*(Evo-1));
}

const compare: Command = {
    data: new SlashCommandBuilder()
            .setName('compare')
            .setDescription('Compare between AniGame cards.')
            .addStringOption(option => 
                option.setName('option1')
                    .setDescription('Name of 1st card.')
                    .setRequired(true)
                )
            .addStringOption(option => 
                option.setName('option2')
                    .setDescription('Name of 2nd card.')
                    .setRequired(true)
                )
            .addStringOption(option => 
                option.setName('option3')
                    .setDescription('Name of 3rd card.')
                )
            .addStringOption(option => 
                option.setName('option4')
                    .setDescription('Name of 4th card.')
                )
            .addStringOption(option => 
                option.setName('option5')
                    .setDescription('Name of 5th card.')
                ),
        async execute(interaction: CustomCommandInteraction): Promise<void> {
            
        const images = [];

        const messageToPaginate =  await interaction.deferReply({
            fetchReply: true
        }) as Message<boolean>;
        const cardNames = [interaction.options.getString('option1', true).trim(), interaction.options.getString('option2', true).trim()];
        let opt = interaction.options.getString('option3');
        if (opt) cardNames.push(opt.trim());
        opt = interaction.options.getString('option4');
        if (opt) cardNames.push(opt.trim());
        opt = interaction.options.getString('option5');
        if (opt) cardNames.push(opt.trim());

        const cards = [
            new MessageEmbed()
                .setTitle('BASE STATS')
                .setColor('#00FFFF')
                .setAuthor({
                    name: interaction.user.username, 
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                })
                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                .setImage('attachment://compare.png')
                .setTimestamp(),
            new MessageEmbed()
                .setTitle('SR Evo 3 | Level 50')
                .setAuthor({
                    name: interaction.user.username, 
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                })
                .setColor('#00FFFF')
                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                .setImage('attachment://compare.png')
                .setTimestamp(),
            new MessageEmbed()
                .setTitle('UR Evo 3 | Level 60')
                .setAuthor({
                    name: interaction.user.username, 
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                })
                .setColor('#00FFFF')
                .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                .setImage('attachment://compare.png')
                .setTimestamp()
        ];
        const correction = [
            statz_formula(1.8, 3, 50), statz_formula(2, 3, 60)
        ]

        for (const name of cardNames) {
            const card: Card | string = await new Promise((resolve, _) => {
                const rows = sqldb.prepare('SELECT * FROM cards WHERE NAME LIKE ?').all("%" + name + "%");
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if ((row.NAME.toLowerCase() === name.toLowerCase()) || (row.NAME.toLowerCase().split(/[\s\(\)]+/).indexOf(name.toLowerCase()) >= 0)) {
                        resolve(row);
                    };
                };
                resolve('notfound')
            });
            if (typeof card !== 'string') {
                images.push(Canvas.loadImage(card.PICTURE));
                cards[0].addFields(
                    {
                        name: `${card.NAME} ${(card.TYPE).trim().split(/\s/)[1]} ${card.EMOJI}`, 
                        value: `**Card Series:** ${card.SERIES}\n**Hp:** ${card.HP}\n**Atk:** ${card.ATK}\n**Def:** ${card.DEF}\n**Speed:** ${card.SPEED}`,
                        inline: true
                    }
                )
                cards[1].addFields(
                    {
                        name: `${card.NAME} ${(card.TYPE).trim().split(/\s/)[1]} ${card.EMOJI}`, 
                        value: `**Hp:** ${Math.trunc(card.HP*correction[0])}\n**Atk:** ${Math.trunc(card.ATK*correction[0])}\n**Def:** ${Math.trunc(card.DEF*correction[0])}\n**Speed:** ${Math.trunc(card.SPEED*correction[0])}`, 
                        inline: true
                    }
                )
                cards[2].addFields(
                    {
                        name: `${card.NAME} ${(card.TYPE).trim().split(/\s/)[1]} ${card.EMOJI}`, 
                        value: `**Hp:** ${Math.trunc(card.HP*correction[1])}\n**Atk:** ${Math.trunc(card.ATK*correction[1])}\n**Def:** ${Math.trunc(card.DEF*correction[1])}\n**Speed:** ${Math.trunc(card.SPEED*correction[1])}`, 
                        inline: true
                    }
                )
            };
        };

        const canvas = Canvas.createCanvas(600*images.length, 640);
        const ctx = canvas.getContext('2d');
        const imageBuffer = await Promise.all(images);

        for (let i=0; i<imageBuffer.length; i++) {
            ctx.drawImage(imageBuffer[i], 480*i, 0, 480, canvas.height)
        }

        const attachment = new MessageAttachment(canvas.toBuffer(), 'compare.png');

	    await interaction.editReply({ 
            embeds: [cards[0]],
            files: [attachment]
         });

        await paginate(interaction, cards, messageToPaginate);
    }
};

export default compare;
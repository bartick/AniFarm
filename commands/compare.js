const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqldb = require('./../utils/sqlite');
const paginate = require('./../utils/paginate')

function statz_formula(R, Evo, Lv) {
    /**R = 1.6 (R) / 1.8 (SR) / 2(UR)
       Evo = 1-3
       LV = R(1+0.005LV)(1+0.15(EVO-1))*/
    return R*(1+0.005*Lv)*(1+0.15*(Evo-1));
}

module.exports = {
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
        async execute(interaction) {
        await interaction.deferReply()
        const cardNames = [interaction.options.getString('option1').trim(), interaction.options.getString('option2').trim()];
        let opt = interaction.options.getString('option3');
        if (!(opt===null)) cardNames.push(opt.trim());
        opt = interaction.options.getString('option4');
        if (!(opt===null)) cardNames.push(opt.trim());
        opt = interaction.options.getString('option5');
        if (!(opt===null)) cardNames.push(opt.trim());

        const cards = [
            new MessageEmbed()
                .setTitle('BASE STATS')
                .setColor('AQUA')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp(),
            new MessageEmbed()
                .setTitle('SR Evo 3 | Level 50')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor('AQUA')
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp(),
            new MessageEmbed()
                .setTitle('UR Evo 3 | Level 60')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor('AQUA')
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTimestamp()
        ];
        const correction = [
            statz_formula(1.8, 3, 50), statz_formula(2, 3, 60)
        ]

        for (const name of cardNames) {
            const card = await new Promise((resolve, reject) => {
                const rows = sqldb.prepare('SELECT * FROM cards WHERE NAME LIKE ?').all("%" + name + "%");
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if ((row.NAME.toLowerCase() === name.toLowerCase()) || (row.NAME.toLowerCase().split(/[\s\(\)]+/).indexOf(name.toLowerCase()) >= 0)) {
                        resolve(row);
                    };
                };
                resolve('notfound')
            });
            if (!(card==='notfound')) {
                cards[0].addField(`${card.NAME} ${(card.TYPE).trim().split(/\s/)[1]} ${card.EMOJI}`, `**Card Series:** ${card.SERIES}\n**Hp:** ${card.HP}\n**Atk:** ${card.ATK}\n**Def:** ${card.DEF}\n**Speed:** ${card.SPEED}`,true)
                cards[1].addField(`${card.NAME} ${(card.TYPE).trim().split(/\s/)[1]} ${card.EMOJI}`, `**Hp:** ${parseInt(card.HP*correction[0])}\n**Atk:** ${parseInt(card.ATK*correction[0])}\n**Def:** ${parseInt(card.DEF*correction[0])}\n**Speed:** ${parseInt(card.SPEED*correction[0])}`, true)
                cards[2].addField(`${card.NAME} ${(card.TYPE).trim().split(/\s/)[1]} ${card.EMOJI}`, `**Hp:** ${parseInt(card.HP*correction[1])}\n**Atk:** ${parseInt(card.ATK*correction[1])}\n**Def:** ${parseInt(card.DEF*correction[1])}\n**Speed:** ${parseInt(card.SPEED*correction[1])}`, true)
            };
        };
        await paginate(interaction, cards, 0);
    }
};
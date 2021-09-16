const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sqldb = require('./../utils/sqlite');
const paginate = require('./../utils/paginate');

function statz_formula(R, Evo, Lv) {
    /**R = 1.6 (R) / 1.8 (SR) / 2(UR)
       Evo = 1-3
       LV = R(1+0.005LV)(1+0.15(EVO-1))*/
    return R*(1+0.005*Lv)*(1+0.15*(Evo-1));
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('cinfo')
            .setDescription('Gets a proper card info about your favourite AniGame card')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Name of the card')
                .setRequired(true)
            ),
        async execute(interaction) {
            const name = interaction.options.getString('name').trim();

            const card = await new Promise((resolve, reject) => {
                sqldb.all("SELECT * FROM cards WHERE NAME LIKE ?", ["%" + name + "%"], (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    for (let i = 0; i < rows.length; i++) {
                        let row = rows[i];
                        if ((row.NAME.toLowerCase() === name.toLowerCase()) || (row.NAME.toLowerCase().split(/[\s\(\)]+/).indexOf(name.toLowerCase()) >= 0)) {
                            resolve(row);
                        };
                    };
                    resolve('notfound')
                });
            });
    
            if (card === 'notfound') {
                const embed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('⛔ Error')
                    .setDescription('I was unable to find the card you are looking for please try with a proper spelling.\nIf you think this is a mistake then please contact the developer')
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTimestamp();
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
                return;
            };
    
            const locfl = await new Promise((resolve, reject) => {
                sqldb.get('SELECT * FROM location WHERE SERIES=?',[card.SERIES], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            });

            const location = card.LOCATION===0 ? 'These cards are not found in any Floor' : card.LOCATION
            const floor = card.LOCATION===0 ? '~~Events~~, Lottery' : `${card.FLOOR}, ${card.FLOOR+locfl.FLOORS}, ${(locfl.FLOORS*2)+card.FLOOR}`

            const sr = [
                statz_formula(1.8,1,50),
                statz_formula(1.8,2,50),
                statz_formula(1.8,3,50)
            ]
            const ur = [
                statz_formula(2,1,60),
                statz_formula(2,2,60),
                statz_formula(2,3,60)
            ]

            embeds = [
                new MessageEmbed()
                    .setColor('#00FFFF')
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTitle(`**${card.NAME}**`)
                    .setDescription(`**Card Series:** ${card.SERIES}\n**Type:** ${card.TYPE}\n**Hp:** ${card.HP}\n**Atk:** ${card.ATK}\n**Def:** ${card.DEF}\n**Speed:** ${card.SPEED}`)
                    .addField('Location 🗺', `**Area:** ${location}\n**FLOOR:** ${floor}`, false)
                    .addField('Talent', `${card.EMOJI} ${card.BASETALENT}`, false)
                    .setImage(card.PICTURE)
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setFooter(`Page 1/3 • ${card.FOOTER} | ID: ${card.ID}`)
                    .setTimestamp(),
                new MessageEmbed()
                    .setColor('#00FFFF')
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setImage(card.PICTURE)
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTitle(`**${card.NAME}**`)
                    .setFooter(`${card.FOOTER} | ID: ${card.ID}`)
                    .addField('SR Evo 1 ', `**Hp:** ${parseInt(card.HP*sr[1])}\n**Atk:** ${parseInt(card.ATK*sr[1])}\n**Def:** ${parseInt(card.DEF*sr[1])}\n**Speed:** ${parseInt(card.SPEED*sr[1])}`, true)
                    .addField('SR Evo 2 ', `**Hp:** ${parseInt(card.HP*sr[2])}\n**Atk:** ${parseInt(card.ATK*sr[2])}\n**Def:** ${parseInt(card.DEF*sr[2])}\n**Speed:** ${parseInt(card.SPEED*sr[2])}`, true)
                    .addField('SR Evo 3 ', `**Hp:** ${parseInt(card.HP*sr[3])}\n**Atk:** ${parseInt(card.ATK*sr[3])}\n**Def:** ${parseInt(card.DEF*sr[3])}\n**Speed:** ${parseInt(card.SPEED*sr[3])}`, true)
                    .addField('SR Talent', `${card.EMOJI} ${card.SRTALENT}`, false)
                    .setFooter(`Page 1/3 • ${card.FOOTER} | ID: ${card.ID}`)
                    .setTimestamp(),
                new MessageEmbed()
                .setColor('#00FFFF')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setImage(card.PICTURE)
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTitle(`**${card.NAME}**`)
                .setFooter(`${card.FOOTER} | ID: ${card.ID}`)
                .addField('UR Evo 1 ', `**Hp:** ${parseInt(card.HP*ur[1])}\n**Atk:** ${parseInt(card.ATK*ur[1])}\n**Def:** ${parseInt(card.DEF*ur[1])}\n**Speed:** ${parseInt(card.SPEED*ur[1])}`, true)
                .addField('UR Evo 2 ', `**Hp:** ${parseInt(card.HP*ur[2])}\n**Atk:** ${parseInt(card.ATK*ur[2])}\n**Def:** ${parseInt(card.DEF*ur[2])}\n**Speed:** ${parseInt(card.SPEED*ur[2])}`, true)
                .addField('UR Evo 3 ', `**Hp:** ${parseInt(card.HP*ur[3])}\n**Atk:** ${parseInt(card.ATK*ur[3])}\n**Def:** ${parseInt(card.DEF*ur[3])}\n**Speed:** ${parseInt(card.SPEED*ur[3])}`, true)
                .addField('UR Talent', `${card.EMOJI} ${card.URTALENT}`, false)
                .setFooter(`Page 1/3 • ${card.FOOTER} | ID: ${card.ID}`)
                .setTimestamp()
            ];

            paginate(interaction, embeds, 0)
        }
};
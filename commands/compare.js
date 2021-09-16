const { SlashCommandBuilder } = require('@discordjs/builders');
const sqldb = require('./../utils/sqlite');


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
        let opt = interaction.options.getString('option3').trim();
        if (!(opt===null)) cardNames.push(opt);
        opt = interaction.options.getString('option4').trim();
        if (!(opt===null)) cardNames.push(opt);
        opt = interaction.options.getString('option5').trim();
        if (!(opt===null)) cardNames.push(opt);

        const cards = []

        for (const name of cardNames) {
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
            if (!(card==='notfound')) cards.push(card);
        };
        await interaction.editReply("done");
        console.log(card);
    }
};
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sqldb = require('./../utils/sqlite');
const wait = require('util').promisify(setTimeout);


module.exports = {
    data: new SlashCommandBuilder()
        .setName('qorder')
        .setDescription('Lets you order a card.')
        .addStringOption(option => option.setName('name').setDescription('Enter a card name to order').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Enter the amount of cards you want to order.').setRequired(true)),
    async execute(interaction) {
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle("SUCCESS")
                .setEmoji('✅'),
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('DANGER')
                .setEmoji('❌')
        );
        const name = interaction.options.getString('name');
        const amount = interaction.options.getInteger('amount');


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

        if (locfl.PLACE===0) {
            const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('⛔ Error')
                .setDescription(`You cannot order a event card like **${card.NAME}**. Don\'t try to be too smart\nIf you think this is a mistake then please contact the developer`)
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setTimestamp();
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
            return;
        };

        card.FL = (locfl.FLOORS*2)+card.FLOOR

        const embed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Please confirm your Order !!!')
            .setAuthor(
                interaction.user.username, 
                interaction.user.displayAvatarURL({dynamic: true, size: 1024})
            )
            .setThumbnail(card.PICTURE)
            .addField(`**Order Summary:** ${card.EMOJI}`, "```\n◙ Card Name: "+card.NAME+"\n◙ Loc-Floor: "+card.LOCATION+"-"+card.FL+"\n◙ Amount: "+amount+"\n◙ Price: "+0+"\n◙ Discount: "+0+"%\n```")
            .setTimestamp();
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
        const filter = (inter) => {
            if ((interaction.user.id === inter.user.id) && ['confirm','cancel'].indexOf(inter.customId)>=0) return true;
            return inter.reply({
                content: "You cannot use this button",
                ephemeral: true
            })
        };

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000, max: 1 });

        collector.on("collect", async i => {
            let id = i.customId;
            for (let i=0; i<row.components.length; i++) {
                row.components[i].disabled = true
            };
            if(id === 'confirm') {
                await i.deferUpdate();
                embed.setColor('#00FF00').setTitle('Order Confirmed!!');
                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
            }
            else {
                await i.deferUpdate();
                embed.setColor('#FF0000').setTitle('Order Cancelled!');
                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
            }
            await wait(3000);
            await interaction.deleteReply();
        });
    }
};
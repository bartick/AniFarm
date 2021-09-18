const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sqldb = require('./../utils/sqlite');
const wait = require('util').promisify(setTimeout);
const settings = require('./../models/settings')
const order = require('./../models/orders')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('qorder')
        .setDescription('Lets you order a card.')
        .addStringOption(option => option.setName('name').setDescription('Enter a card name to order').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Enter the amount of cards you want to order.').setRequired(true)),
    async execute(interaction) {
        if (interaction.guild===null) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                        .setTimestamp()
                        .setColor('RED')
                        .setTitle('⛔ Error')
                        .setDescription('You cannot use this command in DMs. Please go to a server to use this command.')
                ]
            });
            return;
        }
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
        const guildSettings = await settings.findById(interaction.guild.id);
        if (guildSettings==null || guildSettings['pending']===0 || guildSettings['status']===0 || guildSettings['farmer']===0 || guildSettings['prices']==={}) {
            const embed = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setColor('RED')
                .setTimestamp()
                .setTitle('⛔️ Error')
                .setDescription('Settings was not completed properly. Please ask a admin to complete the settings before ordering.')
            await interaction.reply({
                ephemeral: true,
                embeds: [embed]
            });
            return;
        }
        if (guildSettings.order>0 && guildSettings.order!=interaction.channelId) {
            const embed = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setColor('RED')
                .setTimestamp()
                .setTitle('⛔️ Error')
                .setDescription(`You can only use this command in <#${guildSettings['order']}>.\nHead over to that channel to start ordering`)
            
                await interaction.reply({
                    ephemeral: true,
                    embeds: [embed]
                });
                return;
        }
        const name = interaction.options.getString('name').trim(); 
        const amount = interaction.options.getInteger('amount');
        let setOrder = {};
        setOrder['amount'] = amount;
        setOrder['farmer'] = guildSettings.farmer;
        setOrder['customerid'] = interaction.user.id;
        setOrder['pending'] = guildSettings.pending;
        setOrder['status'] = guildSettings.status;
        setOrder['complete'] = guildSettings.complete;
        setOrder['guildid'] = interaction.guild.id;


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

        if (!(interaction.user.id in interaction.client.ordered)) {
            interaction.client.ordered[interaction.user.id]={};
        }
        else {
            if (card.NAME in interaction.client.ordered[interaction.user.id]) {
                if (interaction.client.ordered[interaction.user.id][card.NAME] > Date.now()) {
                    await interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setTimestamp()
                                .setColor('RED')
                                .setTitle('⛔ Error')
                                .setDescription(`You have already ordered it. Please wait 2 hours before ordering again.\nYou can order again: <t:${parseInt(interaction.client.ordered[interaction.user.id][card.NAME]/1000)}:R>`)
                        ]
                    });
                    return;
                }
                else {
                    delete interaction.client.ordered[interaction.user.id][card.NAME];
                }
            }
        }

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

        card.FL = (locfl.FLOORS*2)+card.FLOOR;

        setOrder['image'] = card.PICTURE;
        setOrder['name'] = card.NAME;
        setOrder['location'] = card.LOCATION;
        setOrder['floor'] = card.FL;

        const guildPrice = Object.fromEntries(guildSettings['prices'].entries());

        for (const key in guildPrice) {
            if (card.LOCATION>=guildPrice[key][0] && guildPrice[key][1]>=card.LOCATION){
                setOrder['price'] = amount * parseInt(key);
            }
        }

        //TODO add discount
        setOrder['discount'] = 0;

        const embed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Please confirm your Order !!!')
            .setAuthor(
                interaction.user.username, 
                interaction.user.displayAvatarURL({dynamic: true, size: 1024})
            )
            .setThumbnail(card.PICTURE)
            .addField(`**Order Summary:** ${card.EMOJI}`, "```\n◙ Card Name: "+card.NAME+"\n◙ Loc-Floor: "+card.LOCATION+"-"+card.FL+"\n◙ Amount: "+amount+"\n◙ Price: "+(setOrder.price - setOrder.price*(setOrder.discount/100))+"\n◙ Discount: "+setOrder.discount+"%\n```")
            .setTimestamp();
        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });
        
        setOrder['orderid'] = parseInt(message.id)%100000;

        const filter = (inter) => {
            if ((interaction.user.id === inter.user.id) && ['confirm','cancel'].indexOf(inter.customId)>=0) return true;
            return inter.reply({
                content: "You cannot use this button",
                ephemeral: true
            })
        };

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000, max: 1 });

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
                embed.setColor('AQUA')
                    .setTitle('Waiting for a farmer to accept order!!')
                    .setTimestamp()
                    .setFooter(`If you are a farmer accept the order using /accorder ${setOrder['orderid']}`)
                let content=null;
                if (guildSettings.vacant>0){
                    content = `<@&${guildSettings.vacant}> a new order has arrived.`
                }
                try {
                    const pendingChannel = await i.client.channels.cache.get(setOrder['pending']);
                    const pendingOrder =  await pendingChannel.send({
                        content: content,
                        embeds: [embed]
                    });
                    setOrder['pendingid'] = pendingOrder.id;
                }
                catch (err) {
                    await interaction.followUp({
                        ephemeral: true,
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setColor('RED')
                                .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                                .setTimestamp()
                                .setTitle('⛔️ Error')
                                .setDescription(`An error occured. Make sure I have permission to send message or see the channel <#${setOrder['pending']}>\n\n**Error:**\n${err.message}`)
                        ]
                    });
                    return;
                }
                const odr = new order(setOrder);
                await odr.save();
                interaction.client.ordered[interaction.user.id][card.NAME] = Date.now()+7200000;
            }
            else {
                await i.deferUpdate();
                embed.setColor('#FF0000').setTitle('Order Cancelled!');
                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
            }
            await wait(2000);
            try {
                await interaction.deleteReply();
            } catch(error) {
                //SKIP
            }
        });
        collector.on('end', async collected => {
            if (collected.size===0) {
                embed.setColor('#FF0000').setTitle('Order Cancelled!');
                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
                await wait(2000);
                try {
                    await interaction.deleteReply();
                } catch(error) {
                    //SKIP
                }
            }
        });
    }
};
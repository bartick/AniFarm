const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const orders = require('./../models/orders');
const paginate = require('./../utils/paginate');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('orders')
            .setDescription('Shows all your current order'),
    async execute(interaction) {
        await interaction.deferReply();
        const farming = await orders.find({
            customerid: interaction.user.id
        })
        if (farming.length===0) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('⛔️ Error')
                    .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                    .setTimestamp()
                    .setColor('RED')
                    .setDescription(`**${interaction.user.tag}** you currently have no orders. Please order something in order to see your order status.\nThank You.`)
                ]
            });
            return;
        }
        const embeds = [];
        for (const order of farming) {
            const embed = new MessageEmbed()
                .setColor('AQUA')
                .setThumbnail(order.image)
                .setTimestamp()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true, size: 1024}))
                .setTitle('Farming Status')
            let farmer;
            try {
                farmer = await interaction.client.users.fetch(order.farmerid);
            } catch (err) {
                //SKIP
            };
            if (farmer===undefined) {
                embed.addField('Farmer:', 'No Farmer Found', true)
                    .setFooter('Undefined')
            }
            else {
                embed.setFooter(farmer.username, farmer.displayAvatarURL({dynamic: true, size: 1024}))
                    .addField('Farmer:', farmer.tag, true)
            }
            embed.addField('Customer:', interaction.user.tag, true)
            let guild;
            try {
                guild = await interaction.client.guilds.cache.get(order.guildid);
            } catch(err) {
                //SKIP
            }
            if (guild===undefined) {
                embed.addField('Server:', 'No Guild Found', false)
            } else {
                embed.addField('Server:', guild.name, false)
            }
            embed.addField('Order Summary:',"```\n◙ Card Name: "+order.name+"\n◙ Loc-Floor: "+order.location+"-"+order.floor+"\n◙ Amount: "+order.amount+"\n◙ Price: "+(order.price - order.price*(order.discount/100))+"\n◙ Discount: "+order.discount+'%\n◙ Amount Farmed:'+order.amount_farmed+"/"+order.amount+"\n```", false)
            embeds.push(embed);
        };
        await paginate(interaction, embeds, 0);
        
    }
};
import { 
    SlashCommandBuilder,
    SlashCommandIntegerOption
} from '@discordjs/builders';
import {
    MessageEmbed, 
    User,
    TextChannel,
    NewsChannel,
    MessageActionRow,
    MessageButton,
    Message
} from 'discord.js';
import {
    Command,
    CustomCommandInteraction
} from './../interfaces';
import { 
    OrdersType,
    AnifarmType
} from "../schema";
import { 
    mongodb,
    profiledb
} from "../utils";

const Orders = mongodb.model('orders');
const Profile = profiledb.model('anifarm');

const updatevalue: Command = {
    data: new SlashCommandBuilder()
        .setName('updatevalue')
        .setDescription('Update a value of the amount of cards you have farmed')
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option.setName('value')
                .setDescription('The amount of cards you have farmed')
                .setRequired(true)
        ),
    execute: async (interaction: CustomCommandInteraction) => {
        const value = interaction.options.getInteger('value', true);

        const currentOrder: OrdersType | null = await Orders.findOne({
            farmerid: interaction.user.id,
        });

        if (!currentOrder) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTitle('⛔️ Error')
                        .setDescription('You are not farming in any server. You need to pick up a order in order to use the command.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                        })
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                ]
            });
            return;
        }

        await interaction.deferReply({ephemeral: true});

        let customer: User;

        try {
            customer = await interaction.client.users.fetch(currentOrder.customerid);
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('⛔️ Error')
                    .setDescription(`I cannot find the user in the discord library or I am limited. If you think this is a mistake then here is the user id **${currentOrder.customerid}** and you can report it to the support server.\nThank You.`)
                    .setTimestamp()
                    .setAuthor({
                        name: interaction.user.username, 
                        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                    })
                    .setColor('#ff0000')
                    .setThumbnail(interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '')
                ]
            });
            return;
        };

        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setThumbnail(currentOrder.image)
            .setAuthor({
                name: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
            })
            .setFooter({
                text: `${interaction.user.username} • Order Id ${currentOrder['orderid']}`, 
                iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
            })
            .setTimestamp()
            .setTitle('Farming Status')
            .addField('Farmer:', interaction.user.tag, true)
            .addField('Customer:', customer.tag, false)
            .addField('Order Summary:',"```\n◙ Card Name: "+currentOrder.name+"\n◙ Loc-Floor: "+currentOrder.location+"-"+currentOrder.floor+"\n◙ Amount: "+value+"/"+currentOrder.amount+"\n◙ Price: "+(currentOrder.price - currentOrder.price*(currentOrder.discount/100))+"\n◙ Discount: "+currentOrder.discount+'%\n◙ Amount Farmed:'+value+"/"+currentOrder.amount+"\n```", false)

        if (value>=currentOrder.amount) {
            const minutesWatedFarming = (Date.now()-currentOrder.createdAt.getTime())/(1000*60);
            const hoursWastedFarming = Math.trunc(minutesWatedFarming/60);
            const farmableInXMinutes = Math.trunc((( (3/4)*minutesWatedFarming) + (10*hoursWastedFarming) + Math.trunc(hoursWastedFarming/12)*210)/5);
            const farmerSpeed = Math.trunc((currentOrder.amount/minutesWatedFarming)*1440);
            const farmer: AnifarmType | null = await Profile.findById(currentOrder.farmerid);

            await Orders.deleteOne({
                _id: currentOrder._id
            });
            if (farmer) {
                await Profile.updateOne({
                    _id: currentOrder.customerid
                },
                {
                    $inc: {
                        ordered: 1
                    }
                }) .catch(err => {
                    //SKIP
                });

                const updateFarmerProfile: {
                    $inc?: {
                        farmed?: number,
                    },
                    $set?: {
                        avg?: number
                    }
                } = {
                    $inc: {
                        farmed: 1
                    }
                }
                if (farmableInXMinutes>=currentOrder.amount) {
                    updateFarmerProfile["$set"] = {
                        "avg": Math.trunc((farmerSpeed+farmer.avg)/2)
                    }
                }

                await Profile.updateOne({
                    _id: currentOrder.farmerid
                },
                updateFarmerProfile
                ) .catch(err => {
                    //SKIP
                })
            }
            

            try {
                await customer.send({
                    content: `Your order has been completed by ${interaction.user.tag} (**ID**: ${interaction.user.id}). \nPlease contact the user to setup a trade...`,
                    embeds: [embed]
                });
            } catch (err) {
                //SKIP
            }
            try {
                const statusChannel: TextChannel | NewsChannel | undefined = await interaction.client.channels.cache.get(currentOrder.status) as TextChannel | NewsChannel | undefined;
                if (statusChannel) {
                    const statusOrder = await statusChannel.messages.fetch(currentOrder.statusid);
                    await statusOrder.delete()
                }
            } catch (err) {
                //SKIP
            }
            try {
                const complete: TextChannel | NewsChannel | undefined = await interaction.client.channels.cache.get(currentOrder.complete) as TextChannel | NewsChannel | undefined;
                if (complete) {
                    await complete.send({
                        embeds: [embed]
                    });
                }
                
            } catch(err) {
                // SKIP
            }
            const copyButton= new MessageActionRow<MessageButton>()
                .addComponents(
                    new MessageButton()
                        .setCustomId('copy')
                        .setLabel('DM A COPY')
                        .setStyle('PRIMARY')
                )
            await interaction.editReply({
                content: `You have completed order for ${customer.tag} (**ID**: ${customer.id}). \nPlease contact the user to setup a trade... `,
                embeds: [embed],
                components: [
                    copyButton
                ],
            });

            const storeCopy: Message<boolean> = await interaction.fetchReply() as Message<boolean>;

            const filter = (inter: any) => {
                if ((interaction.user.id === inter.user.id) && inter.customId==='copy') return true;
                return inter.reply({
                    content: "You cannot use this button",
                    ephemeral: true
                })
            };
            const collector = await storeCopy.createMessageComponentCollector({ filter, time: 30000, max: 1 });
            collector.on('collect', async inter => {
                copyButton.components[0].setDisabled(true);
                
                try {
                    await inter.user.send({
                        content: `You have completed order for ${customer.tag} (**ID**: ${customer.id}). \nPlease contact the user to setup a trade... `,
                        embeds: [embed]
                    })
                    copyButton.components[0].setLabel('DM SENT!');
                } catch (err) {
                    copyButton.components[0].setLabel('DM CLOSED!');
                }
                await inter.update({
                    content: `You have completed order for ${customer.tag} (**ID**: ${customer.id}). \nPlease contact the user to setup a trade... `,
                    embeds: [embed],
                    components: [
                        copyButton
                    ]
                });
            })

        }
        else {
            let toUpdate: {
                amount_farmed?: number,
                statusid?: string,
            } = {
                amount_farmed: value
            };

            try {
                const statusChannel: TextChannel | NewsChannel | undefined = await interaction.client.channels.cache.get(currentOrder.status) as TextChannel | NewsChannel | undefined;
                if (statusChannel) {
                    try {
                    
                        const statusOrder: Message<boolean> = await statusChannel.messages.fetch(currentOrder.statusid);
                        try {
                            await statusOrder.edit({
                                embeds: [embed]
                            });
                        } catch (e) {
                            //SKIP
                        }
                    
                    } catch (err) {
                        try {
                            const statusMessage = await statusChannel.send({
                                embeds: [embed]
                            });

                            toUpdate['statusid'] = statusMessage.id;
                        } catch (e) {
                            //SKIP
                        }
                    }
                }
            } catch(error) {
                //SKIP
            }

            await Orders.updateOne({
                _id: currentOrder._id
            }, {
                $set: toUpdate
            });

            await interaction.editReply({
                content: '✅ Successfully Updated.'
            })
        }
    }
}

export default updatevalue;
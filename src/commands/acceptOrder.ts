import { 
    SlashCommandBuilder, 
    SlashCommandIntegerOption 
} from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import {
    OrderManager
} from './../utils';

const accorder: Command = {
    data: new SlashCommandBuilder()
        .setName('accorder')
        .setDescription('Accept a order from the server')
        .addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName('orderid')
            .setDescription('Use the order id to accept the order')
            .setRequired(true)
        ),
    rateLimitName: 'ACCEPT_ORDER',
    execute: async(interaction: CustomCommandInteraction) => {
        const rateLimit: Array<String> = interaction.client.rateLimit?.get('ACCEPT_ORDER') as Array<String>;

        await interaction.deferReply({
            ephemeral: true
        });

        const orderId = interaction.options.getInteger('orderid', true);

        if (rateLimit.indexOf(orderId.toString())>=0) {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Rate Limited')
                        .setDescription('Somone already trying to accept this order. Please wait for them to finish.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                size: 1024,
                            })
                        })
                ]
            });
            return;
        }

        interaction.client.rateLimit?.set('ACCEPT_ORDER', [...rateLimit, orderId.toString()]);

        const Manager = new OrderManager(interaction);

        const getOrder = await Manager.getOrder(orderId);
        if(!getOrder) {
            await interaction.editReply({
                embeds: [
                    Manager.errorEmbed('No order found with this order')
                ]
            });
            interaction.client.rateLimit?.set('ACCEPT_ORDER', rateLimit.filter((id) => id !== orderId.toString()));
            return;
        }

        const accepted = await Manager.acceptOrder();
        if(!accepted) {
            // await interaction.editReply({
            //     embeds: [
            //         Manager.errorEmbed('Failed to accept order')
            //     ]
            // });
            interaction.client.rateLimit?.set('ACCEPT_ORDER', rateLimit.filter((id) => id !== orderId.toString()));
            return;
        }
        await interaction.editReply({
            content: `Order successfully accepted`
        });
        interaction.client.rateLimit?.set('ACCEPT_ORDER', rateLimit.filter((id) => id !== orderId.toString()));
    }
}

export default accorder;
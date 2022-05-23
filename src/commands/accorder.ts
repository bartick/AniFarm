import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { Command, CustomCommandInteraction } from "../interfaces";

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
        const orderid: Number = interaction.options.get('orderid', true).value as Number;
        if (rateLimit.indexOf(orderid.toString())>=0) {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Rate Limited')
                        .setDescription('Somone already trying to accept this order. Please wait for them to finish.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                ]
            });
            return;
        }
        interaction.client.rateLimit?.set('ACCEPT_ORDER', [...rateLimit, orderid.toString()]);
        await interaction.deferReply();
        // TODO: Implement
    }
}

export default accorder;
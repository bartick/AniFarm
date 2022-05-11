import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../interfaces";

const accorder: Command = {
    data: new SlashCommandBuilder()
        .setName('accorder')
        .setDescription('Accept a order from the server')
        .addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName('orderid')
            .setDescription('Use the order id to accept the order')
            .setRequired(true)
        ),
    execute: async(interaction: CommandInteraction) => {
        // TODO: Implement
    }
}

export default accorder;
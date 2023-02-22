import { 
    SlashCommandBuilder, 
    SlashCommandIntegerOption 
} from "@discordjs/builders";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import {
    OrderManager
} from './../utils';

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
        await interaction.deferReply({
            ephemeral: true
        });

        const value = interaction.options.getInteger('value', true);
        
        const Manager = new OrderManager(interaction);

        const check = await Manager.getOrderByFarmer();
        if(!check) {
            interaction.editReply({
                embeds: [
                    Manager.errorEmbed('You do not have an order to update')
                ]
            });
            return;
        }

        const updateCheck = await Manager.updateValue(value);
        if(!updateCheck) {
            interaction.editReply({
                embeds: [
                    Manager.errorEmbed('There was an error updating your order')
                ]
            });
            return;
        }
    }
}

export default updatevalue;
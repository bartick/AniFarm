import { 
    SlashCommandBuilder 
} from "@discordjs/builders";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import { 
    OrderManager 
} from "../utils";

const farming: Command = {
    data: new SlashCommandBuilder()
        .setName("farming")
        .setDescription("Shows what you are farming currently"),
    execute: async (interaction: CustomCommandInteraction) => {
        await interaction.deferReply({
            ephemeral: true
        });

        const Manager = new OrderManager(interaction);
        const check = await Manager.getOrderByFarmer();

        if(!check) {
            interaction.editReply({
                embeds: [
                    Manager.errorEmbed("You are not farming anything")
                ]
            });

            return;
        }

        const embed = await Manager.completedOrderEmbed();

        interaction.editReply({
            embeds: [
                embed
            ]
        });

    }
};

export default farming;
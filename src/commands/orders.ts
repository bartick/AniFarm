import { 
    SlashCommandBuilder 
} from "@discordjs/builders";
import { 
    Message 
} from "discord.js";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import { 
    OrderManager,
    paginate
} from "../utils";

const orders: Command = {
    data: new SlashCommandBuilder()
        .setName("orders")
        .setDescription("Shows all of your orders"),
    execute: async (interaction: CustomCommandInteraction) => {
        const message = await interaction.deferReply({
            fetchReply: true
        }) as Message<boolean>;

        const Manager = new OrderManager(interaction);
        const embeds = await Manager.checkOrderPlacedEmbeds();

        if(embeds.length === 0) {
            interaction.editReply({
                embeds: [
                    Manager.errorEmbed("You have no orders")
                ]
            });

            return;
        }

        await paginate(interaction, embeds, message)

    }
}

export default orders;
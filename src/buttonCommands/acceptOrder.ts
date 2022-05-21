import { ButtonInteraction } from "discord.js";
import { ButtonCommand } from "../interfaces";

const acceptOrder: ButtonCommand = {
    name: 'ORDER_PICKUP',
    execute: async(interaction: ButtonInteraction) => {
        await interaction.reply({
            content: 'You are picking this order'
        })
    }
}

export default acceptOrder;
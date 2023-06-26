import { ButtonCommand, CustomButtonInteraction } from "../interfaces";
import { OrderManager } from "../utils";

const acceptOrder: ButtonCommand = {
    name: 'ORDER_PICKUP',
    execute: async(interaction: CustomButtonInteraction) => {
        await interaction.deferUpdate();

        const Manager = new OrderManager(interaction);

        const getOrder = await Manager.getOrderByPeningId(interaction.message.id);
        if (!getOrder) {
            await interaction.followUp({
                embeds: [
                    Manager.errorEmbed('No order found with this order')
                ],
                ephemeral: true
            });
            return;
        }

        const accepted = await Manager.acceptOrder()

        if(accepted) {
            await interaction.followUp({
                content: `Order successfully accepted`,
                ephemeral: true
            });
        }

    }
}

export default acceptOrder;
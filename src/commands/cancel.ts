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
} from "../utils";

const cancel: Command = {
    data: new SlashCommandBuilder()
        .setName('cancel')
        .setDescription('Cancel your current order.')
        .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('orderid')
                    .setDescription('The order ID to cancel.')
                    .setRequired(true)
                ),
    execute: async (interaction: CustomCommandInteraction) => {
        await interaction.deferReply({
            ephemeral: true
        });

        const orderid = interaction.options.getInteger('orderid', true);

        const Manager = new OrderManager(interaction);
        const order = await Manager.getOrder(orderid);
        if(!order) {
            await interaction.editReply({
                embeds: [
                    Manager.errorEmbed(`Order ${orderid} not found.`)
                ]
            });

            return;
        }

        await Manager.cancelOrder();
    }
};

export default cancel;
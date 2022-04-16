import { Interaction } from "discord.js";
import { Event, CustomCommandInteraction, Command } from "../interfaces";

const manageCommandInteraction = async (interaction: CustomCommandInteraction) => {
    const command: Command | undefined = interaction?.client?.commands?.get(interaction.commandName);
    if (command) {
        await command.execute(interaction)
                .catch((error: Error) => {
                    console.error(error.message);
                });
    }
}

const interactionCreate: Event = {
    name: 'interactionCreate',
    execute(interaction: Interaction) {
        if (interaction.isCommand()) {
            manageCommandInteraction(interaction);
        }
    }
}


export default interactionCreate;
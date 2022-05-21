import { CacheType, Interaction } from "discord.js";
import { Event, CustomCommandInteraction, Command, ButtonCommand, CustomButtonInteraction } from "../interfaces";

const manageCommandInteraction = async (interaction: CustomCommandInteraction) => {
    const command: Command | undefined = interaction?.client?.commands?.get(interaction.commandName);
    if (command) {
        await command.execute(interaction)
                .catch((error: Error) => {
                    console.error(error.message);
                });
    }
}

const buttonComponentInteraction =async (interaction: CustomButtonInteraction  ) => {
    const buttonCommands: ButtonCommand | undefined = interaction.client?.buttons?.get(interaction.customId)
    if (buttonCommands) {
        await buttonCommands.execute(interaction)
                .catch((error: Error) => {
                    console.error(error.message);
                });
    }
}

const interactionCreate: Event = {
    name: 'interactionCreate',
    execute(interaction: Interaction<CacheType>) {
        if (interaction.isCommand()) {
            manageCommandInteraction(interaction);
        } else if (interaction.isButton()) {
            buttonComponentInteraction(interaction);
        } else {
            interaction.channel?.send({
                embeds: [{
                    title: 'Error',
                    description: 'I don\'t know what to do with this interaction',
                    color: 0xff000,
                }],

            });
        }
    }
}


export default interactionCreate;
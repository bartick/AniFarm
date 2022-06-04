import { CacheType, Interaction, MessageEmbed } from "discord.js";
import { Event, CustomCommandInteraction, Command, ButtonCommand, CustomButtonInteraction } from "../interfaces";

const manageCommandInteraction = async (interaction: CustomCommandInteraction) => {
    if (interaction.guild===null) {
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('⛔️ Error')
                    .setDescription('This command can only be used in a server.')
                    .setTimestamp()
                    .setThumbnail(interaction.client.user?.displayAvatarURL({
                        dynamic: true,
                        size: 1024,
                    }) || '')
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }),
                    }),
            ],
            ephemeral: true
        });
        return;
    };
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
        const rateLimit: Array<String> = interaction.client.rateLimit?.get(interaction.customId) as Array<String>;
        if (rateLimit.indexOf(interaction.message.id) >= 0) {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('⛔️ Rate Limited')
                        .setDescription('This button is already being used by someone else. Please wait for them to finish.')
                        .setTimestamp()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024,
                            })
                        })
                ],
                ephemeral: true
            });
            return;
        }
        interaction.client.rateLimit?.set(interaction.customId, [...rateLimit, interaction.message.id]);
        await buttonCommands.execute(interaction)
            .catch((error: Error) => {
                console.error(error.message);
            });
        interaction.client.rateLimit?.set(interaction.customId, interaction.client.rateLimit?.get(interaction.customId)?.filter((id: String) => id !== interaction.message.id) as Array<String>);
    }
}

const interactionCreate: Event = {
    name: 'interactionCreate',
    execute(interaction: Interaction<CacheType>) {
        if (interaction.isCommand()) {
            manageCommandInteraction(interaction);
        } else if (interaction.isButton()) {
            buttonComponentInteraction(interaction);
        } else if (interaction.isModalSubmit()) {
            return;
        } else {
            interaction.channel?.send({
                embeds: [{
                    title: 'Error',
                    description: 'I don\'t know what to do with this interaction',
                    color: 0xff000,
                    timestamp: new Date(),
                    thumbnail: {
                        url: interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }),
                    },
                    author: {
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024,
                        }),
                    }
                }],

            });
        }
    }
}


export default interactionCreate;
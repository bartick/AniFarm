
import { 
    SlashCommandBuilder, 
    SlashCommandIntegerOption, 
    SlashCommandStringOption 
} from "@discordjs/builders";
import { 
    EmbedBuilder, Guild,
} from "discord.js";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import { 
    SettingsType 
} from "../schema";
import { 
    mongodb,
    Water,
    Fire,
    Ground,
    Light,
    Dark,
    Neutral,
    Grass,
    Electric,
    OrderManager,
    SoulEnums
} from "../utils";

const Settings = mongodb.models['settings'];
// const AddOrders = mongodb.models['orders'];

const qorder: Command = {
    data: new SlashCommandBuilder()
        .setName('qorder')
        .setDescription('Time to order a card!')
        .addStringOption((option: SlashCommandStringOption) =>
            option
                .setName('soul')
                .setDescription('The name of the card')
                .setRequired(true)
                .addChoices({
                    name: Water,
                    value: Water
                }, {
                    name: Fire,
                    value: Fire
                }, {
                    name: Ground,
                    value: Ground
                }, {
                    name: Light,
                    value: Light
                }, {
                    name: Dark,
                    value: Dark
                }, {
                    name: Neutral,
                    value: Neutral
                }, {
                    name: Grass,
                    value: Grass
                }, {
                    name: Electric,
                    value: Electric
                })
        )
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option
                .setName('amount')
                .setDescription('The amount of cards to order')
                .setRequired(true)
                .setMinValue(50)
        ),
    execute: async(interaction: CustomCommandInteraction) => {
        await interaction.deferReply();

        const soul = interaction.options.getString('soul', true) as keyof typeof SoulEnums;
        const amount = interaction.options.getInteger('amount', true);

        if (interaction.guild?.id===undefined) {
            interaction.editReply({
                content: "You cannot use this command in DM",
            })
            return
        }

        const settings: SettingsType | null = await Settings.findOne({_id: parseInt((interaction.guild as Guild ).id)});
        if (settings === null) {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({ size: 1024})
                        })
                        .setTitle("⛔️ Error")
                        .setDescription("Please ask the server admin to complete the settings before you can use this command here.")
                        .setTimestamp()
                        .setColor('#FF0000')
                        .setThumbnail(interaction.user.displayAvatarURL({ size: 1024}))
                ],
            })
            return;
        }

        if (interaction.channelId !== (settings as SettingsType).order && (settings as SettingsType).order!=="0") {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({ size: 1024})
                        })
                        .setTitle("⛔️ Error")
                        .setDescription("You can only use this command in the channel <#" + (settings as SettingsType).order + ">")
                        .setTimestamp()
                        .setColor('#FF0000')
                        .setThumbnail(interaction.user.displayAvatarURL({ size: 1024}))
                ]
            })
            return
        }

        const Manager = new OrderManager(interaction);
        Manager.setCustomer(interaction.user);
        await Manager.createOrder(soul, amount, (settings as SettingsType), interaction.user.id);

    }
}

export default qorder;
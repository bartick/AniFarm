import { 
    SlashCommandBuilder, 
    SlashCommandIntegerOption, 
    SlashCommandRoleOption, 
    SlashCommandStringOption, 
    SlashCommandSubcommandBuilder 
} from "@discordjs/builders";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";

const discount: Command = {
    data: new SlashCommandBuilder()
        .setName('discount')
        .setDescription('Sets up discounts for you')
        .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('role')
            .setDescription('Sets Up role type discounts')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('type')
                .setDescription('Choose the type')
                .addChoice('add','add')
                .addChoice('remove', 'remove')
                .setRequired(true)
            )
            .addRoleOption((option: SlashCommandRoleOption) => 
                option.setName('name')
                .setDescription('Select a role to add')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('discount')
                .setDescription('Select a discount percentage')
            )
        )
        .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('order')
            .setDescription('Sets up order type discounts')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('type')
                .setDescription('Choose the type')
                .addChoice('add','add')
                .addChoice('remove', 'remove')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('number')
                .setDescription('Select number of order to get discount')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('discount')
                .setDescription('Select a discount percentage')
            )
        )
        .addSubcommand( (subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('daily')
            .setDescription('Sets up daily discounts')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('time')
                .setDescription('Select number of orders to get discount')
                .setRequired(true)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName('discount')
                .setDescription('Select a discount percentage')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) => 
            subcommand.setName('view')
            .setDescription('View the discounts the server provide')
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName('type')
                .setDescription('Type of discount')
                .setRequired(true)
                .addChoice('daily', 'daily')
                .addChoice('server', 'server')
            )
        )
        ,
    execute: async(interaction: CustomCommandInteraction) => {
        await interaction.reply('Hello World!');
    }
}

export default discount;
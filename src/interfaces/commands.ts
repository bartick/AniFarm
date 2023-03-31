import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CustomButtonInteraction, CustomCommandInteraction } from './CustomInteraction';

interface Command {
    data: Omit<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">;
    rateLimitName?: string | undefined;
    execute: (interaction: CustomCommandInteraction) => Promise<void>;
}

interface ButtonCommand {
    name: string;
    execute: (interaction: CustomButtonInteraction) => Promise<void>;
}

export {
    Command,
    ButtonCommand,
}
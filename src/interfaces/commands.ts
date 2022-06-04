import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { ButtonInteraction, CommandInteraction } from 'discord.js';

interface Command {
    data: Omit<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">;
    rateLimitName?: string | undefined;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

interface ButtonCommand {
    name: string;
    execute: (interaction: ButtonInteraction) => Promise<void>;
}

export {
    Command,
    ButtonCommand,
}
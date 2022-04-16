import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export default Command;
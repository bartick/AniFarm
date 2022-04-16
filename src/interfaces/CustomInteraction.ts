import { CommandInteraction } from "discord.js";
import ClientUser from "./ClientUser";

export interface CustomCommandInteraction extends CommandInteraction {
    client: ClientUser;
};
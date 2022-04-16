import { Client, Collection } from "discord.js";
import commands from './commands';

interface ClientUser extends Client {
    power?: Array<string>;
    commands?: Collection<string, commands>;
}

export default ClientUser;
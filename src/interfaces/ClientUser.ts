import { Client, Collection } from "discord.js";
import {Command, ButtonCommand} from './';

interface ClientUser extends Client {
    power?: Array<string>;
    commands?: Collection<string, Command>;
    buttons?: Collection<string, ButtonCommand>;
    rateLimit?: Map<string, Array<String>>;
}

export default ClientUser;
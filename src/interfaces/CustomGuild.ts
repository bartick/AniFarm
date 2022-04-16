import { Guild } from "discord.js";
import ClientUser from "./ClientUser";

interface CustomGuild extends Guild {
    client: ClientUser;
};

export default CustomGuild;
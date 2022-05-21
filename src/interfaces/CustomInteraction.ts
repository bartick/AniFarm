import { ButtonInteraction, CommandInteraction } from "discord.js";
import ClientUser from "./ClientUser";

interface CustomCommandInteraction extends CommandInteraction {
    client: ClientUser;
};

interface CustomButtonInteraction extends ButtonInteraction {
    client: ClientUser;
}

export {
    CustomCommandInteraction,
    CustomButtonInteraction
}
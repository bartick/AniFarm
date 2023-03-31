import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import ClientUser from "./ClientUser";

interface CustomCommandInteraction extends ChatInputCommandInteraction {
    client: ClientUser;
};

interface CustomButtonInteraction extends ButtonInteraction {
    client: ClientUser;
}

export {
    CustomCommandInteraction,
    CustomButtonInteraction
}
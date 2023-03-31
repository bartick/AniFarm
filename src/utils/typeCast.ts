import { 
    ActionRowBuilder, 
    TextInputBuilder
} from "discord.js";

export class ModalActionRow extends ActionRowBuilder<TextInputBuilder> {
    constructor() {
        super();
    };
};
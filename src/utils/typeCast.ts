import { 
    MessageActionRow, 
    TextInputComponent 
} from "discord.js";

export class ModalActionRow extends MessageActionRow<TextInputComponent> {
    constructor() {
        super();
    };
};
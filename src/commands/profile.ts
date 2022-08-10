import { 
    SlashCommandBuilder, 
    SlashCommandSubcommandBuilder, 
    SlashCommandUserOption 
} from "@discordjs/builders";
import { 
    MessageActionRow, 
    Modal, 
    ModalActionRowComponent, 
    TextInputComponent, 
    ModalSubmitInteraction, 
    CacheType, 
    MessageEmbed, 
    User, 
    MessageButton,
    Message,
    MessageComponentInteraction,
    MessageActionRowComponent
} from "discord.js";
import { 
    Command, 
    CustomCommandInteraction 
} from "../interfaces";
import { 
    AnifarmType
} from "../schema";
import { 
    getUserProfile, 
    profiledb 
} from "../utils";

const Profile = profiledb.models['anifarm'];

async function badgeCorousel(interaction: CustomCommandInteraction, badges: Array<MessageEmbed>) {
    const message: Message<boolean> = await interaction.fetchReply() as Message<boolean>;

    const collector = message.createMessageComponentCollector({ filter: (inter: any) => {
            if ((interaction.user.id === inter.user.id) && ['left','love','right','close'].indexOf(inter.customId)>=0) return true;
            return inter.reply({
                content: "You cannot use this button",
                ephemeral: true
            });
        },
        time: 60000, 
        componentType: 'BUTTON' 
    });

    let index = 0;

    collector.on('collect', async (inter: MessageComponentInteraction) => {
        const id = inter.customId;
        await inter.deferUpdate();
        switch(id) {
            case 'left':
                if (message.components[0].components[2].disabled) message.components[0].components[2].disabled = false;
                index--;
                if (index==0) message.components[0].components[0].disabled = true;
                await message.edit({
                    embeds: [badges[index]],
                    components: [message.components[0]],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'right':
                if (message.components[0].components[0].disabled) message.components[0].components[0].disabled = false;
                index++;
                if (index==badges.length-1) message.components[0].components[2].disabled = true;
                await message.edit({
                    embeds: [badges[index]],
                    components: [message.components[0]],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'love': 
                message.components[0].components.forEach((comp: MessageActionRowComponent) => {
                    comp.disabled = true;
                });
                badges[index].description = "You have loved this badge and I have set it to your profile";
                await message.edit({
                    embeds: [badges[index]],
                    components: [message.components[0]],
                });
                await Profile.updateOne(
                    {
                        _id: interaction.user.id
                    },
                    {
                        $set: {
                            setBadges: badges[index].image?.url
                        }
                    }).catch((err: Error) => {
                    console.error(err.message);
                })
                break;
            case 'close':
                await message.delete();
                
        }
    })
}

const profile: Command = {
    data: new SlashCommandBuilder()
            .setName('profile')
            .setDescription('Play with profile.')
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) => 
                subcommand.setName('register')
                    .setDescription('Register for a profile')
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand.setName('view')
                    .setDescription('View your/others profile.')
                    .addUserOption((option: SlashCommandUserOption) =>
                        option.setName('user')
                            .setDescription('The user to view.')
                            .setRequired(false)
                    )
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand.setName('edit')
                    .setDescription('Edit your profile')
            )
            .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
                subcommand.setName('badges')
                    .setDescription('View your badges. And Choose your favourite.')
            ),
    execute: async (interaction: CustomCommandInteraction) => {
        const subcommand = interaction.options.getSubcommand();

        const userProfile: AnifarmType | null  = await getUserProfile(interaction.user.id);

        if (subcommand !== 'register' && userProfile===null) {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle('⛔️ Error')
                        .setDescription('You are not registered for a profile. Please use `profile register` to register.')
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({
                            dynamic: true,
                            size: 1024
                        }) || '')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024
                            })
                        })
                ]
            });
            return;
        }

        switch (subcommand) {
            case 'register':
                await interaction.reply('Registering for a profile.');
                break;
            case 'view':
                await interaction.deferReply()
                const user: User | null = interaction.options.getUser('user');
                let profileToView: AnifarmType | null = null;
                if (user !== null) {
                    profileToView= await getUserProfile(user.id);
                } else {
                    profileToView = userProfile;
                }
                
                if (profileToView === null) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('⛔️ Error')
                                .setDescription('User does not have a profile.')
                                .setColor('#ff0000')
                                .setThumbnail(interaction.client.user?.displayAvatarURL({
                                    dynamic: true,
                                    size: 1024
                                }) || '')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({
                                        dynamic: true,
                                        size: 1024
                                    })
                                })
                                .setTimestamp()
                        ]
                    });
                    return;
                }

                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#00FFFF')
                            .setAuthor({
                                name: interaction.user.username, 
                                iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 1024})
                            })
                            .setTitle(`🌾 ${user?.username || interaction.user.username} 👨‍🌾`)
                            .addFields(
                                {name:'Total Order Farmed', value: String(profileToView.farmed), inline: false},
                                {name: 'Total Fodders Ordered', value: String(profileToView.ordered), inline: false},
                                {name: 'Speed', value: `${profileToView.avg} cards/day`, inline: false},
                                {name: 'Rating', value: `${'★'.repeat(profileToView.speed)}`, inline: false}
                            )
                            .setImage(profileToView.pimage)
                            .setDescription(profileToView.pstatus)
                            .setThumbnail(profileToView.setBadges===""?interaction.client.user?.displayAvatarURL({dynamic: true, size: 1024}) || '':profileToView.setBadges)
                            .setTimestamp()

                    ]
                });
                break;
            case 'edit':
                const modal = new Modal()
                        .setCustomId('edit-profile')
                        .setTitle('Edit Profile')
                        .setComponents(
                            new MessageActionRow<ModalActionRowComponent>()
                                .addComponents(
                                    new TextInputComponent()
                                        .setCustomId('edit-image')
                                        .setLabel('Image')
                                        .setPlaceholder('Image URL')
                                        .setStyle('SHORT')
                                ),
                            new MessageActionRow<ModalActionRowComponent>()
                                .addComponents(
                                    new TextInputComponent()
                                        .setCustomId('edit-description')
                                        .setLabel('Description')
                                        .setPlaceholder('Enter your new status description.')
                                        .setStyle('PARAGRAPH')
                                )
                        )
                await interaction.showModal(modal);
                const filter = (inter: ModalSubmitInteraction) => inter.customId === 'edit-profile';
                const modalInteraction: ModalSubmitInteraction<CacheType> = await interaction.awaitModalSubmit({
                    filter, time: 120000,
                });
                await modalInteraction.deferReply();
                const image = modalInteraction.fields.getTextInputValue('edit-image');
                const description = modalInteraction.fields.getTextInputValue('edit-description');

                let toUpdate: {pimage?: string, pstatus?: string} = {};

                if (image.match(/^https?:\/\/.+(jpe?g|png|gif)$/)) {
                    toUpdate['pimage'] = image;
                }
                if (description!=='') {
                    toUpdate['pstatus'] = description;
                }

                if (Object.keys(toUpdate).length>0) {
                    await Profile.updateOne({_id: interaction.user.id}, {$set: toUpdate})
                                   .catch(() => {})
                }

                await modalInteraction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('✅ Profile Updated')
                            .setDescription('Your profile has been updated.')
                            .setColor('#00ff00')
                            .setThumbnail(interaction.client.user?.displayAvatarURL({
                                dynamic: true,
                                size: 1024
                            }) || '')
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({
                                    dynamic: true,
                                    size: 1024
                                })
                            })
                            .setTimestamp()
                    ]
                });

                break;
            case 'badges':
                await interaction.deferReply();
                const embeds: Array<MessageEmbed> = [];
                for(let i=0; i<(userProfile as AnifarmType).badges.length; i++) {
                    embeds.push(
                        new MessageEmbed()
                            .setTitle('🏅 Badge')
                            .setColor('#00ff00')
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({
                                    dynamic: true,
                                    size: 1024
                                })
                            })
                            .setThumbnail(interaction.client.user?.displayAvatarURL({
                                dynamic: true,
                                size: 1024
                            }) || '')
                            .setImage((userProfile as AnifarmType).badges[i])
                            .setTimestamp()
                    )
                }
                await interaction.editReply({
                    embeds: [embeds[0]],
                    components: [
                        new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('left')
                                .setLabel('<')
                                .setStyle('PRIMARY')
                                .setDisabled(true),
                            new MessageButton()
                                .setCustomId('love')
                                .setLabel('❤')
                                .setStyle('DANGER'),
                            new MessageButton()
                                .setCustomId('right')
                                .setLabel('>')
                                .setStyle('PRIMARY'),
                            new MessageButton()
                                .setCustomId('close')
                                .setLabel('Close')
                                .setStyle('SECONDARY')
                        )
                    ]
                });

                await badgeCorousel(interaction, embeds);
                break;
            default:
                await interaction.reply('Unknown subcommand.');
        }
    }
}

export default profile;
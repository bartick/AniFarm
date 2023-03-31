import { 
    SlashCommandBuilder, 
    SlashCommandSubcommandBuilder, 
    SlashCommandUserOption 
} from "@discordjs/builders";
import { 
    ActionRowBuilder, 
    ModalBuilder, 
    ModalSubmitInteraction, 
    CacheType, 
    EmbedBuilder, 
    User, 
    Message,
    MessageComponentInteraction,
    ComponentType,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle
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

async function badgeCorousel(interaction: CustomCommandInteraction, badges: Array<EmbedBuilder>, messageComponents: ActionRowBuilder<ButtonBuilder>) {
    const message: Message<boolean> = await interaction.fetchReply() as Message<boolean>;

    const collector = message.createMessageComponentCollector({ filter: (inter: any) => {
            if ((interaction.user.id === inter.user.id) && ['left','love','right','close'].indexOf(inter.customId)>=0) return true;
            return inter.reply({
                content: "You cannot use this button",
                ephemeral: true
            });
        },
        time: 60000, 
        componentType: ComponentType.Button 
    });

    let index = 0;

    collector.on('collect', async (inter: MessageComponentInteraction) => {
        const id = inter.customId;
        await inter.deferUpdate();
        switch(id) {
            case 'left':
                if (messageComponents.components[2].data.disabled) messageComponents.components[2].data.disabled = false;
                index--;
                if (index==0) messageComponents.components[0].data.disabled = true;
                await message.edit({
                    embeds: [badges[index]],
                    components: [messageComponents],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'right':
                if (messageComponents.components[0].data.disabled) messageComponents.components[0].data.disabled = false;
                index++;
                if (index==badges.length-1) messageComponents.components[2].data.disabled = true;
                await message.edit({
                    embeds: [badges[index]],
                    components: [messageComponents],
                })
                .catch((err: Error) => {
                    console.error(err.message);
                });
                break;
            case 'love': 
            messageComponents.components.forEach((comp: ButtonBuilder) => {
                    comp.data.disabled = true;
                });
                badges[index].data.description = "You have loved this badge and I have set it to your profile";
                await message.edit({
                    embeds: [badges[index]],
                    components: [messageComponents],
                });
                await Profile.updateOne(
                    {
                        _id: interaction.user.id
                    },
                    {
                        $set: {
                            setBadges: badges[index].data.image?.url
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
                    new EmbedBuilder()
                        .setTitle('⛔️ Error')
                        .setDescription('You are not registered for a profile. Please use `profile register` to register.')
                        .setColor('#ff0000')
                        .setThumbnail(interaction.client.user?.displayAvatarURL({
                            size: 1024
                        }) || '')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL({
                                size: 1024
                            })
                        })
                ]
            });
            return;
        }

        switch (subcommand) {
            case 'register':
                if (userProfile !== null) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('⛔️ Error')
                                .setDescription('You are already registered for a profile.')
                                .setColor('#ff0000')
                                .setThumbnail(interaction.client.user?.displayAvatarURL({
                                    size: 1024
                                }) || '')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({
                                        size: 1024
                                    })
                                })
                        ]
                    });
                    return;
                }

                const profile = new Profile({
                    _id: interaction.user.id,
                });

                await profile.save()

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('✅ Success')
                            .setDescription('You have successfully registered for a profile.')
                            .setColor('#00ff00')
                            .setThumbnail(interaction.client.user?.displayAvatarURL({
                                size: 1024
                            }) || '')
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({
                                    size: 1024
                                })
                            })
                    ]
                });

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
                            new EmbedBuilder()
                                .setTitle('⛔️ Error')
                                .setDescription('User does not have a profile.')
                                .setColor('#ff0000')
                                .setThumbnail(interaction.client.user?.displayAvatarURL({
                                    size: 1024
                                }) || '')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL({
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
                        new EmbedBuilder()
                            .setColor('#00FFFF')
                            .setAuthor({
                                name: interaction.user.username, 
                                iconURL: interaction.user.displayAvatarURL({ size: 1024})
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
                            .setThumbnail(profileToView.setBadges===""?interaction.client.user?.displayAvatarURL({ size: 1024}) || '':profileToView.setBadges)
                            .setTimestamp()

                    ]
                });
                break;
            case 'edit':
                const modal = new ModalBuilder()
                        .setCustomId('edit-profile')
                        .setTitle('Edit Profile')
                        .setComponents(
                            new ActionRowBuilder<TextInputBuilder>()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('edit-image')
                                        .setLabel('Image')
                                        .setPlaceholder('Image URL')
                                        .setStyle(TextInputStyle.Short)
                                ),
                            new ActionRowBuilder<TextInputBuilder>()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId('edit-description')
                                        .setLabel('Description')
                                        .setPlaceholder('Enter your new status description.')
                                        .setStyle(TextInputStyle.Paragraph)
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
                        new EmbedBuilder()
                            .setTitle('✅ Profile Updated')
                            .setDescription('Your profile has been updated.')
                            .setColor('#00ff00')
                            .setThumbnail(interaction.client.user?.displayAvatarURL({
                                size: 1024
                            }) || '')
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({
                                    size: 1024
                                })
                            })
                            .setTimestamp()
                    ]
                });

                break;
            case 'badges':
                await interaction.deferReply();
                const embeds: Array<EmbedBuilder> = [];
                for(let i=0; i<(userProfile as AnifarmType).badges.length; i++) {
                    embeds.push(
                        new EmbedBuilder()
                            .setTitle('🏅 Badge')
                            .setColor('#00ff00')
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL({
                                    size: 1024
                                })
                            })
                            .setThumbnail(interaction.client.user?.displayAvatarURL({
                                size: 1024
                            }) || '')
                            .setImage((userProfile as AnifarmType).badges[i])
                            .setTimestamp()
                    )
                }
                const messageComponents = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('left')
                                    .setLabel('<')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId('love')
                                    .setLabel('❤')
                                    .setStyle(ButtonStyle.Danger),
                                new ButtonBuilder()
                                    .setCustomId('right')
                                    .setLabel('>')
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId('close')
                                    .setLabel('Close')
                                    .setStyle(ButtonStyle.Secondary)
                            );
                await interaction.editReply({
                    embeds: [embeds[0]],
                    components: [
                        messageComponents
                    ]
                });

                await badgeCorousel(interaction, embeds, messageComponents);
                break;
            default:
                await interaction.reply('Unknown subcommand.');
        }
    }
}

export default profile;
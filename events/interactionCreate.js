'use strict';
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			await command.execute(interaction)
					.catch(error => {
						console.error(error);
						if (interaction.replied) {
							await interaction.editReply({ content: 'There was an error while executing this command! Please report this to **Bartick**', ephemeral: true })
									.catch(err => {
										//SKIP
									})
						} else {
							await interaction.reply({ content: 'There was an error while executing this command! Please report this to **Bartick**', ephemeral: true })
									.catch(err => {
										//SKIP
									})
						}
					});
		}
	},
};
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
	
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				try {
					await interaction.reply({ content: 'There was an error while executing this command! ', ephemeral: true });
				} catch (err) {
					try {
						await interaction.editReply({ content: 'There was an error while executing this command! ', ephemeral: true });
					} catch (e) {
						// SKIP
					}
				}
			}
		}
	},
};
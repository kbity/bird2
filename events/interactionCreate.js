const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				try {await interaction.followUp({ content: 'an error happened! please report this bug', ephemeral: true });} catch(err) {await interaction.channel.send('command timed out, try again\n-# note: data might have been saved before the fail, don\'t panic')}
			} else {
				try {await interaction.reply({ content: 'an error happened! please report this bug', ephemeral: true });} catch(err) {await interaction.channel.send('command timed out, try again\n-# note: data might have been saved before the fail, don\'t panic')}
			}
		}
	},
};


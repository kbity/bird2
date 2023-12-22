const { SlashCommandBuilder } = require('discord.js');
const whitelist = require('./say-whitelist.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Repeats a message in the channel.')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('The message to repeat.')
				.setRequired(true)),
	async execute(interaction) {
		const message = interaction.options.getString('message');
		const member = interaction.member;

		// Check if user is on the whitelist or is a server admin
		if (
			whitelist.includes(member.user.id) ||
			member.permissions.has('ADMINISTRATOR')
		) {
			await interaction.reply({ content: `You said: ${message}`, ephemeral: true });

			// Send the message in the channel
			await interaction.channel.send(message);
		} else {
			await interaction.reply({
				content: 'You do not have permission to use this command.',
				ephemeral: true,
			});
		}
	},
};


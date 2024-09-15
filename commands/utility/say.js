const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
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
		const user = interaction.user;

		// Check if the command is being used in a DM
		if (!interaction.guild) {
			// If in DMs, allow the command without any permission check
			await interaction.reply({ content: `You said: ${message}`, ephemeral: true });

			// Ensure interaction.channel exists before sending the message
			await interaction.user.send(message);
		} else {
			// In a guild, check if the user is whitelisted or has Administrator permission
			if (
				whitelist.includes(user.id) ||
				member.permissions.has(PermissionsBitField.Flags.Administrator)
			) {
				await interaction.reply({ content: `You said: ${message}`, ephemeral: true });

				// Send the message in the channel
				await interaction.channel.send(message);
			} else {
				// User doesn't have permission
				await interaction.reply({
					content: 'You do not have permission to use this command.',
					ephemeral: true,
				});
			}
		}
	},
};


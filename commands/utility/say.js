const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

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
        if (message.startsWith("bird!gift")){
            await interaction.reply("Don't you know that Property is Theft? Now you're under arrest, 'cause I got nothing left.")
		    const userId = interaction.user.id;
		    const achievementGranted = achHandler.grantAchievement(userId, 26, interaction);
            return}
		// Check if the command is being used in a DM
		if (!interaction.guild) {
			// If in DMs, allow the command without any permission check
			await interaction.reply({ content: `You said: ${message}`, ephemeral: true });

			// Ensure interaction.channel exists before sending the message
			await interaction.user.send(message);
		} else {
			// In a guild, check if the user is whitelisted or has Administrator permission
			if (
				config.sayWhitelist.includes(user.id) ||
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


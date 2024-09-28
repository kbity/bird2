const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json'); // Adjust the path if necessary
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rate')
		.setDescription('Rate anything from 0 to 5 stars')
		.addStringOption(option => 
			option.setName('input')
				.setDescription('The item to rate')
				.setRequired(true)),
	async execute(interaction) {
		const input = interaction.options.getString('input');
		const rating = roundToNearestHalf(Math.random() * 5); // Random rating between 0 and 5, rounded to nearest half
		const fullStars = Math.floor(rating);
		const halfStar = rating % 1 >= 0.5 ? 1 : 0;
		const emptyStars = 5 - fullStars - halfStar;

		const stars = config.emojis.fullStar.repeat(fullStars) + 
		              config.emojis.halfStar.repeat(halfStar) + 
		              config.emojis.emptyStar.repeat(emptyStars);

		await interaction.reply(`as a bird, i rate ${input} ${rating}/5 birds. ${stars}`);
		const userId = interaction.user.id;
		const achievementGranted = achHandler.grantAchievement(userId, 7, interaction);
	},
    userApp: true, // Flag to enable adding user app mode
};

function roundToNearestHalf(num) {
    return Math.round(num * 2) / 2;
}

const { SlashCommandBuilder } = require('discord.js');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('catgirl')
		.setDescription('Retrieve a catgirl from nekos.best'),
	async execute(interaction) {
		fetch('https://nekos.best/api/v2/neko')
			.then(response => response.json())
			.then(json => {
				const imageUrl = json.results[0].url;
				interaction.reply(imageUrl);
				const userId = interaction.user.id;
				const achievementGranted = achHandler.grantAchievement(userId, 9, interaction);
			})
			.catch(error => {
				console.error('Error fetching neko image:', error);
				interaction.reply('Could not fetch neko image.');
			});
	},
    userApp: true, // Flag to enable adding user app mode
};

const { SlashCommandBuilder } = require('discord.js');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Retrieve a Bird from some random API.'),
	async execute(interaction) {
		fetch('https://some-random-api.com/animal/bird')
			.then(response => response.json())
			.then(json => {
				const imageUrl = json.image;
				interaction.reply(imageUrl);
				const userId = interaction.user.id;
				setTimeout(() => {achHandler.grantAchievement(userId, 17, interaction);}, 2000);
			})
			.catch(error => {
				console.error('Error fetching bird image:', error);
				interaction.reply('Could not fetch bird image.');
			});
	},
    userApp: true, // Flag to enable adding user app mode
};

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bird')
		.setDescription('bird'),
	async execute(interaction) {
		// Load bird emojis from birds.json
		const birds = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../birds.json'), 'utf8'));
		const birdEmojis = birds.map(bird => bird.emoji);

		const randomIndex = Math.floor(Math.random() * 100);
		let selectedEmoji;

		if (randomIndex < 50) {
			selectedEmoji = '<:bird:1214018194423947264>';
		} else {
			const otherBirdIndex = Math.floor(Math.random() * birdEmojis.length);
			selectedEmoji = birdEmojis[otherBirdIndex];
		}

		await interaction.reply(selectedEmoji);
	},
        userApp: true, // Flag to enable adding user app mode
};

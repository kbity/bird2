const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('real')
		.setDescription('Real'),
	async execute(interaction) {
		await interaction.reply('https://i.imgur.com/4OEHzSz.png');
	},
};


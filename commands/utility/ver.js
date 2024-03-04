const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ver')
		.setDescription('Gets Bird Version'),
	async execute(interaction) {
		await interaction.reply('Bird 2.1');
	},
};


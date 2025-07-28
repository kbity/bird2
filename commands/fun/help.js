const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('anybody there???'),
	async execute(interaction) {
		await interaction.reply('*but nobody came*');
	},
    userApp: true, // Flag to enable adding user app mode
};


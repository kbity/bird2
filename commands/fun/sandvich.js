const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sandvich')
		.setDescription('Om nom nom'),
	async execute(interaction) {
		await interaction.reply('https://www.youtube.com/watch?v=qQ36Repf-ZQ');
	},
    userApp: true, // Flag to enable adding user app mode
};


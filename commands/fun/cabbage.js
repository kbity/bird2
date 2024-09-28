const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cabbage')
		.setDescription('Plant vs zombie'),
	async execute(interaction) {
		await interaction.reply('https://cdn.discordapp.com/attachments/806268326031917067/1218060235135254588/cabbagepultchickent2.png');
	},
    userApp: true, // Flag to enable adding user app mode
};


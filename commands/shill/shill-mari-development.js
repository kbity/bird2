const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shill-mari-development')
		.setDescription('Shill Mari Development'),
	async execute(interaction) {
		await interaction.reply("https://discord.gg/RZYa2CWfxd");
	},
    userApp: true, // Flag to enable adding user app mode
};


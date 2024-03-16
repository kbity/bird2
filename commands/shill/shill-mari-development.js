const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shill-mari-development')
		.setDescription('Shill Mari Development'),
	async execute(interaction) {
		await interaction.reply("https://media.discordapp.net/attachments/990334332231090217/1218237630936911922/attachment.gif");
	},
};


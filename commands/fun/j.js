const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('j')
		.setDescription('Joke'),
	async execute(interaction) {
		await interaction.reply("ayo bruv don't be offended by that ^^^\nit was a joke, a harmless prank, a little bit of trolling and maybe they got too silly");
	},
};


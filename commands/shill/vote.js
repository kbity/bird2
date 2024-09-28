const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Link to vote bird on top.gg'),
	async execute(interaction) {
		await interaction.reply("Vote here if you'd like\nhttps://top.gg/bot/1118256931040149626");
	},
    userApp: true, // Flag to enable adding user app mode
};


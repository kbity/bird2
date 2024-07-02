const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ver')
		.setDescription('Gets Bird Version'),
	async execute(interaction) {
    const embed = {
            title: `bird v2.3.1`,
            description: 'bird may be out of date, check this for updates:\nhttps://github.com/The-WindowsVista/bird2',
        };
        await interaction.reply({ embeds: [embed] });
    },
};
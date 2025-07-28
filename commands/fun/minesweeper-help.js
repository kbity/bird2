const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minesweeper-help')
		.setDescription('Minesweeper instructions and Rules'),
	async execute(interaction) {
		await interaction.reply("Minesweeper Rules:\n1. If you find a <:x_:1139345434054242344>, you lose.\n2. Please don't cheat, if you post the solution, you may be banned depending on the server's mods.\n3. Once you reveal every tile that isn't a mine (in this 9x9 board, there is 10), you win.\n4. React <:f_:1139350834778480680> if you win, and <:l_:1139351570522329240> if you lose.\n5. The top left corner is always safe, so start there.");
	},
};


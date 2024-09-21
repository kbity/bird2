const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bird')
		.setDescription('bird'),
	async execute(interaction) {
		const birdEmojis = [
			'<:finebird:1286845187515088966>',
			'<:goodbird:1286845183232573501>',
			'<:rarebird:1218383448176070757>',
			'<:evilbird:1218386113195147354>',
			':bird:',
			'<:coolbird:1214020650918871132>',
			'<:cartoon_bird:1218436570093191218>',
			'<:grayscalebird:1218388224737677443>',
			'<:8bitbird:1218422953147109478>',
			'<:goldbird:1214020841625362442>',
			'<:mythicbird:1218389161942188063>',
			'<:amdbird:1218387652974346310>',
			'<:realbird:1286849329398808668>',
			'<:secretbird:1284628943093239910>',
			'<:mlgbird:1218385321490776146>'
		];

		const randomIndex = Math.floor(Math.random() * 100);
		let selectedEmoji;

		if (randomIndex < 50) {
			selectedEmoji = '<:bird:1214018194423947264>';
		} else {
			const otherBirdIndex = Math.floor(Math.random() * birdEmojis.length);
			selectedEmoji = birdEmojis[otherBirdIndex];
		}

		await interaction.reply(selectedEmoji);
	},
};


const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { version } = require('../../birdfslib.js');

const embed = new EmbedBuilder()
	.setColor(0xfb5f44)
	.setTitle('bird2 by mari2')
	.setURL('https://github.com/kbity/bird2/')
	.setAuthor({ name: 'Mari Kepler (@mari2)' })
	.setDescription(`bird is a discord bot made by mari2 that does many random things, created with botghost originally for the /cuddle command, and later ballooned into what it is today.

Thanks to:
**Lia Milenakos/Cat Bot & Contributors** for the bird hunt idea
**Layna** – Designed the 8-bit and Cartoon birds, slight code improvements
**snowdropwcue** – Designed the mythic bird
**Ethereal** – the reason why bird even exists
**BotGhost** – for the original bird bot, before bird2
**Stuartt** – for annoying popup, which led to marikov
**Blobkat** – for the blob bird idea
**Kalitwo** – for the alien bird and inverse bird
**Horse.san** – for the lowteirbird
**Robert Donner & Curt Johnson (Microsoft)** – for minesweeper and its assets
**Icoeye** – for progressbar95
**Natalie** – for helping me get the bot verified
And thanks to *You* for using bird!
oh and [join the discord](https://discord.gg/rkH6R7avx7)`)
	.setTimestamp()
	.setFooter({ text: `bird ${version}`, iconURL: 'https://media.discordapp.net/attachments/1290044430350422059/1376326038573023302/bird.jpeg?ex=6834eb02&is=68339982&hm=700cf7ec39a9470f23697e412f1a7c0ca5632c96174f81e04c49eeb2fb9734a6'});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('info about bird'),
	async execute(interaction) {
		await interaction.reply({ embeds: [embed] });
	},
};


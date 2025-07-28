const { SlashCommandBuilder } = require('discord.js');
const { minSpawnTime, maxSpawnTime } = require('../../config.json');
const { loadChannels } = require('../../birdfslib');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('last')
		.setDescription('shows when bird was caught in channel last'),
	async execute(interaction) {
        const channels = await loadChannels(interaction.guild.id);
        const channelId = interaction.channel.id;
        if (channels.get(channelId) == undefined)
            {await interaction.reply("no spawn data available, try running `/birdhunt add`"); return}
        const lasttimestamp = channels.get(channelId).lastCaught
        const disctimestamp = Math.floor(lasttimestamp / 1000)
        const birdis = channels.get(channelId).birdPresent
        const min = minSpawnTime * 60
        const max = maxSpawnTime * 60
        if (birdis == true)
            {await interaction.reply("there's a bird rn"); return}
		await interaction.reply(`last caught time for #\`${interaction.channel.name}\` is <t:${disctimestamp}:f>\nnext spawn is between <t:${disctimestamp + min}:R> and <t:${disctimestamp + max}:R>`);
	},
};


const { SlashCommandBuilder } = require('discord.js');
const {
    loadInventories,
    saveInventories
} = require('../../birdfslib');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('gets a ping'),
	async execute(interaction) {
        const inventories = await loadInventories(interaction.user.id);
        let inventory = inventories.get("item");
        if (!inventory) {
            inventory = {};
            inventories.set("item", inventory);
        }
        inventory["ping"] = (inventory["ping"] || 0) + 1;
        let time = Date.now()
		try {await interaction.reply(`+1 ping (${time - interaction.createdTimestamp}ms)\n-# looking for better tested ping? try bird!ping`);} catch(err) {await interaction.channel.send(`+1 ping (${interaction.createdTimestamp - time}ms)\n-# looking for better tested ping? try bird!ping`);}
        await saveInventories(interaction.user.id, inventories);
	},
    userApp: true, // Flag to enable adding user app mode
};


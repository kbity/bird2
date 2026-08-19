const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const {
    loadJsonFile,
    loadInventories,
    saveInventories
} = require('../../birdfslib.js');

let inventoryFilePath = './per_user/null.json';

const birdsFilePath = './data.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('convert birds into money 🤑🤑🤑🤑')
        .addStringOption(option =>
            option.setName('bird')
                .setDescription('The type of bird to turn into money')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('The number of birds to turn into money')
                .setRequired(false)),
    async execute(interaction) {
        const birdData = await loadJsonFile(birdsFilePath);
        const senderId = interaction.user.id;
        const inventories = await loadInventories(senderId);

        const birdType = interaction.options.getString('bird').toLowerCase();
        const quantity = interaction.options.getInteger('quantity') || 1;

        if (quantity <= 0) {
            await interaction.reply({ content: `You can't buy birds, are you stoopid?`, ephemeral: true });
            return;
        }

        if (!birdData[birdType]) {
            await interaction.reply({ content: `apparently there's no **'${birdType}**s.`, ephemeral: true });
            return;
        }

        const senderInventory = inventories.get("bird") || {};
        const recipientInventory = inventories.get("item") || {};

        if (!senderInventory[birdType] || senderInventory[birdType] < quantity) {
            await interaction.reply({ content: `You don't have ${quantity} ${birdType}(s) to sell.`, ephemeral: true });
            return;
        }

        senderInventory[birdType] -= quantity;
        if (senderInventory[birdType] === 0) {
            delete senderInventory[birdType];
        }
        inventories.set("bird", senderInventory);

        recipientInventory["bird_money"] = (recipientInventory["bird_money"] || 0) + Math.floor(quantity * birdData[birdType].value);
        inventories.set("item", recipientInventory);

        await saveInventories(senderId, inventories);

	    try {
	    	await interaction.reply(`${interaction.user.username} has sold ${quantity} ${birdData[birdType].emoji} ${birdType}(s) for ${Math.floor(quantity * birdData[birdType].value)} bird money!`);
	    } catch (error) {
	    	await interaction.channel.send(`${interaction.user.username} has sold ${quantity} ${birdData[birdType].emoji} ${birdType}(s) for ${Math.floor(quantity * birdData[birdType].value)} bird money!`);
	    }

        achHandler.grantAchievement(senderId, 32, interaction);
        
    },
    userApp: true, // Flag to enable adding user app mode
};


const { SlashCommandBuilder } = require('discord.js');
const { clientId } = require('../../config.json');
const fs = require('fs');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const {
    loadJsonFile,
    loadInventories,
    saveInventories
} = require('../../birdfslib.js');

// File path for storing birds data
const birdsFilePath = './data.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Gift a bird to another user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to gift the bird to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('bird')
                .setDescription('The type of bird to gift')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('The number of birds to gift')
                .setRequired(false)),
    async execute(interaction) {
        const birdData = await loadJsonFile(birdsFilePath);
        // Load inventories
        const senderId = interaction.user.id;
        const inventoryA = await loadInventories(senderId);

        // Get user IDs
        const targetUser = interaction.options.getUser('target');
        const targetId = targetUser.id;
        const inventoryB = await loadInventories(targetId);

        if (senderId == targetId) {
            await interaction.reply(`sorry ${interaction.user.username} but i cannot fulfil this request because i am aroace`);
            const achievementGranted = achHandler.grantAchievement(interaction.user.id, 33, interaction);
            return;
        }

        // Get bird type and quantity to gift
        const birdType = interaction.options.getString('bird').toLowerCase();
        const quantity = interaction.options.getInteger('quantity') || 1;

        // Ensure the quantity is positive
        if (quantity <= 0) {
            await interaction.reply({ content: `we are NOT doing that incident again, blud.`, ephemeral: true });
            return;
        }

        // Check if the bird type is valid
        if (!birdData[birdType]) {
            await interaction.reply({ content: `apparently there's no **${birdType}s**.`, ephemeral: true });
            return;
        }

        // Get sender's inventory
        const senderInventory = inventoryA.get("bird") || {};

        // Check if the sender has enough birds
        if (!senderInventory[birdType] || senderInventory[birdType] < quantity) {
            await interaction.reply({ content: `you don't have ${quantity} ${birdType}s to gift, youre pore :sob:`, ephemeral: true });
            return;
        }

        // Deduct birds from sender's inventory
        senderInventory[birdType] -= quantity;
        if (senderInventory[birdType] === 0) {
            delete senderInventory[birdType];
        }
        inventoryA.set("bird", senderInventory);

        // Add birds to recipient's inventory
        const recipientInventory = inventoryB.get("bird") || {};
        recipientInventory[birdType] = (recipientInventory[birdType] || 0) + quantity;
        inventoryB.set("bird", recipientInventory);

        // Save inventories
        await saveInventories(senderId, inventoryA);
        await saveInventories(targetId, inventoryB);

        // Send confirmation message
	    try {
	    	await interaction.reply(`${interaction.user} has gifted ${quantity} ${birdData[birdType].emoji} ${birdType}(s) to ${targetUser}!`);
	    } catch (error) {
	    	await interaction.channel.send(`${interaction.user} has gifted ${quantity} ${birdData[birdType].emoji} ${birdType}(s) to ${targetUser}!`);
	    }
        
        // Handle achievements
        const userId = interaction.user.id;
        const userId2 = targetUser.id;
        const achievementGranted = achHandler.grantAchievement(userId, 10, interaction);
        const achievementGranted2 = achHandler.grantAchievement(userId2, 11, interaction, targetUser.username);
        if (targetId == clientId) {
            const achievementGranted3 = achHandler.grantAchievement(userId, 30, interaction);
            if (birdType == 'divine bird' && quantity == 5) {
            const achievementGranted4 = achHandler.grantAchievement(userId, 31, interaction);
            }
        }
    },
    userApp: true, // Flag to enable adding user app mode
};


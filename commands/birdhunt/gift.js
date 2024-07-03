const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

// File path for storing birds data
const birdsFilePath = './birddata.json';

// Function to load inventories from file
function loadInventories() {
    try {
        const data = fs.readFileSync(inventoryFilePath);
        return new Map(Object.entries(JSON.parse(data)));
    } catch (err) {
        console.error('Error loading inventories:', err);
        return new Map();
    }
}

// Function to load JSON data from file
function loadJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading file ${filePath}:`, err);
        return null;
    }
}

// Function to save inventories to file
function saveInventories(inventories) {
    try {
        const dataToSave = {};
        inventories.forEach((value, key) => {
            dataToSave[key] = value;
        });
        fs.writeFileSync(inventoryFilePath, JSON.stringify(dataToSave));
    } catch (err) {
        console.error('Error saving inventories:', err);
    }
}

// Load bird data
const birdData = loadJsonFile(birdsFilePath);

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
        // Load inventories
        const inventories = loadInventories();

        // Get user IDs
        const senderId = interaction.user.id;
        const targetUser = interaction.options.getUser('target');
        const targetId = targetUser.id;

        // Get bird type and quantity to gift
        const birdType = interaction.options.getString('bird').toLowerCase();
        const quantity = interaction.options.getInteger('quantity') || 1;

        // Check if the bird type is valid
        if (!birdData[birdType]) {
            await interaction.reply({ content: `Invalid bird type: ${birdType}.`, ephemeral: true });
            return;
        }

        // Get sender's inventory
        const senderInventory = inventories.get(senderId) || {};

        // Check if the sender has enough birds
        if (!senderInventory[birdType] || senderInventory[birdType] < quantity) {
            await interaction.reply({ content: `You don't have ${quantity} ${birdType}(s) to gift.`, ephemeral: true });
            return;
        }

        // Deduct birds from sender's inventory
        senderInventory[birdType] -= quantity;
        if (senderInventory[birdType] === 0) {
            delete senderInventory[birdType];
        }
        inventories.set(senderId, senderInventory);

        // Add birds to recipient's inventory
        const recipientInventory = inventories.get(targetId) || {};
        recipientInventory[birdType] = (recipientInventory[birdType] || 0) + quantity;
        inventories.set(targetId, recipientInventory);

        // Save inventories
        saveInventories(inventories);

        // Send confirmation message
        await interaction.reply(`${interaction.user.username} has gifted ${quantity} ${birdData[birdType].emoji} ${birdType}(s) to ${targetUser.username}!`);
    },
};

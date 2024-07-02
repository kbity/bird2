const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

// File path for storing birds data
const birdsFilePath = './birddata.json';

// Define bird emojis and spawn weights
const birdData = loadJsonFile(birdsFilePath);

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your bird inventory'),
    async execute(interaction) {
        // Load user's inventory
        const inventories = loadInventories();

        // Get user's ID
        const userId = interaction.user.id;

        // Get user's inventory
        const userInventory = inventories.get(userId) || {};

        // Filter out bird types with quantity zero
        const userBirds = Object.entries(userInventory)
            .filter(([_, quantity]) => quantity > 0);

        // Check if user has no birds
        if (userBirds.length === 0) {
            await interaction.reply('You have no birds.');
            return;
        }

        // Sort bird types by spawn weight (rarest first)
        userBirds.sort(([typeA, _], [typeB, __]) => birdData[typeB].spawnWeight - birdData[typeA].spawnWeight);

        // Prepare embed for inventory
        const inventoryEmbed = {
            color: 0x0099ff,
            title: 'Your Bird Inventory',
            fields: []
        };

        // Loop through the sorted bird types and quantities in the user's inventory
        for (const [birdType, quantity] of userBirds) {
            const birdEmoji = birdData[birdType].emoji;
            inventoryEmbed.fields.push({
                name: `${birdEmoji} ${birdType}`,
                value: `Quantity: ${quantity}`,
                inline: true
            });
        }

        // Send the inventory embed to the user
        await interaction.reply({ embeds: [inventoryEmbed] });
    },
};


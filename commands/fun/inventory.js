const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

// Define bird emojis and spawn weights
const birdData = {
    'fine bird': { emoji: '<:bird:1214018194423947264>', spawnWeight: 1000 },
    'good bird': { emoji: '<:bird:1214018194423947264>', spawnWeight: 800 },
    'rare bird': { emoji: '<:rarebird:1218383448176070757>', spawnWeight: 500 },
    'evil bird': { emoji: '<:evilbird:1218386113195147354>', spawnWeight: 250 },
    'discord bird': { emoji: '🐦', spawnWeight: 220 },
    'cool bird': { emoji: '<:coolbird:1214020650918871132>', spawnWeight: 125 },
    'cartoon bird': { emoji: '<:cartoonbird:1218387018678272161>', spawnWeight: 75 },
    'black and white bird': { emoji: '<:blackandwhitebird:1218388224737677443>', spawnWeight: 40 },
    '8-bit bird': { emoji: '<:8bitbird:1218383149302677535>', spawnWeight: 25 },
    'gold bird': { emoji: '<:goldbird:1214020841625362442>', spawnWeight: 15 },
    'mythical bird': { emoji: '<:mythicbird:1218389161942188063>', spawnWeight: 8 },
    'AMD bird': { emoji: '<:amdbird:1218387652974346310>', spawnWeight: 4 },
    'real bird': { emoji: '<:realbird:1214020424233521192>', spawnWeight: 2 },
    'MLG bird': { emoji: '<:mlgbird:1218385321490776146>', spawnWeight: 1 }
};

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


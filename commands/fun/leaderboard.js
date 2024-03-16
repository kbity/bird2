const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

// Bird data with spawn weights
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
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading inventories:', err);
        return {};
    }
}

// Function to calculate total bird count for a user
function calculateTotalBirdCount(inventory) {
    let totalBirdCount = 0;
    for (const quantity of Object.values(inventory)) {
        totalBirdCount += quantity;
    }
    return totalBirdCount;
}

// Function to find the rarest bird for a user
function findRarestBird(inventory) {
    let rarestBird = null;
    let minSpawnWeight = Infinity;
    for (const [birdType, quantity] of Object.entries(inventory)) {
        const spawnWeight = birdData[birdType].spawnWeight;
        if (spawnWeight < minSpawnWeight) {
            minSpawnWeight = spawnWeight;
            rarestBird = birdType;
        }
    }
    return rarestBird;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the bird leaderboard'),
    async execute(interaction) {
        // Load inventories
        const inventories = loadInventories();

        // Calculate total bird count and find rarest bird for each user
        const userStats = [];
        for (const [userId, inventory] of Object.entries(inventories)) {
            const totalBirdCount = calculateTotalBirdCount(inventory);
            const rarestBird = findRarestBird(inventory);
            userStats.push({ userId, totalBirdCount, rarestBird });
        }

        // Sort users by total bird count (descending order)
        userStats.sort((a, b) => b.totalBirdCount - a.totalBirdCount);

        // Prepare leaderboard embed
        const leaderboardEmbed = {
            color: 0x0099ff,
            title: 'Bird Leaderboard',
            fields: []
        };

        // Add top 10 users to the embed
        const topUsers = userStats.slice(0, 10);
        for (let i = 0; i < topUsers.length; i++) {
            const user = await interaction.client.users.fetch(topUsers[i].userId);
            const rarestBirdEmoji = birdData[topUsers[i].rarestBird].emoji;
            leaderboardEmbed.fields.push({
                name: `${rarestBirdEmoji} ${user.username}`,
                value: `Total Bird Count: ${topUsers[i].totalBirdCount}`,
                inline: false
            });
        }

        // Send the leaderboard embed
        await interaction.reply({ embeds: [leaderboardEmbed] });
    },
};


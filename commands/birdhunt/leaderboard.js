const {  SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

// File path for storing birds data
const birdsFilePath = './birddata.json';

// Bird data with spawn weights
const birdData = loadJsonFile(birdsFilePath);

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

// Function to calculate total bird count for a user
function calculateTotalBirdCount(inventory) {
    let totalBirdCount = 0;
    for (const [birdType, quantity] of Object.entries(inventory)) {
        if (birdType === 'slowestTime' || birdType === 'fastestTime') {
            continue;
        }
        totalBirdCount += quantity;
    }
    return totalBirdCount;
}

// Function to find the rarest bird for a user
function findRarestBird(inventory) {
    let rarestBird = null;
    let minSpawnWeight = 0;
    for (const [birdType, quantity] of Object.entries(inventory)) {
        if (birdType === 'slowestTime' || birdType === 'fastestTime') {
            continue;
        }
        const spawnWeight = birdData[birdType].value;
        if (spawnWeight > minSpawnWeight) {
            minSpawnWeight = spawnWeight;
            rarestBird = birdType;
        }
    }
    return rarestBird;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the bird leaderboard')
        .addBooleanOption(option =>
            option.setName('global')
                .setDescription('Show global leaderboard')
                .setRequired(false)),
    async execute(interaction) {
        // Load inventories
        const inventories = loadInventories();

        // Calculate total bird count and find rarest bird for each user
        let userStats = [];
        for (const [userId, inventory] of Object.entries(inventories)) {
            const totalBirdCount = calculateTotalBirdCount(inventory);
            const rarestBird = findRarestBird(inventory);
            userStats.push({ userId, totalBirdCount, rarestBird });
        }

        // Filter users by server membership if global option is not enabled
        const globalOption = interaction.options.getBoolean('global');
        if (!globalOption) {
            await interaction.guild.members.fetch();
            const guildMembers = interaction.guild.members;
            userStats = userStats.filter(user => guildMembers.cache.has(user.userId));
        }

        // Sort users by total bird count (descending order)
        userStats.sort((a, b) => b.totalBirdCount - a.totalBirdCount);

        // Prepare leaderboard embed
        const leaderboardEmbed = {
            color: 0x0099ff,
            title: globalOption ? 'Global Bird Leaderboard' : 'Local Bird Leaderboard',
            fields: []
        };

        // Add top 10 users to the embed
        const topUsers = userStats.slice(0, 10);
        for (let i = 0; i < topUsers.length; i++) {
            const user = await interaction.client.users.fetch(topUsers[i].userId);
            let rarestBirdEmoji = birdData[topUsers[i].rarestBird]?.emoji || ":rofl:";
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


const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

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
        .setName('inventory')
        .setDescription('View your bird inventory or the inventory of another user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose inventory to view')),
    async execute(interaction) {
        // Load inventories
        const inventories = loadInventories();

        // Get the user ID of the inventory to view
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;

        // Get user's inventory
        const userInventory = inventories.get(userId) || {};

        // Filter out bird types with quantity zero and ignore "fastestTime" and "slowestTime"
        const userBirds = Object.entries(userInventory)
            .filter(([birdType, quantity]) => quantity > 0 && birdType !== 'fastestTime' && birdType !== 'slowestTime');

        // Check if user has no birds
        if (userBirds.length === 0) {
            await interaction.reply(`${targetUser.username} has no birds.`);
            return;
        }

        // Sort bird types by spawn weight (rarest first)
        userBirds.sort(([typeA, _], [typeB, __]) => birdData[typeA].value - birdData[typeB].value);

        // Calculate total birds
        const totalBirds = userBirds.reduce((sum, [_, quantity]) => sum + quantity, 0);

        // Prepare embed for inventory
        const inventoryEmbed = {
            color: 0x0099ff,
            title: `${targetUser.username}'s Bird Inventory`,
            description: `Total Birds: ${totalBirds}\nFastest Catch Time: ${formatCatchTime(userInventory.fastestTime)}\nSlowest Catch Time: ${formatCatchTime(userInventory.slowestTime)}`,
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

        // Check for achievements
        const allBirdTypes = Object.keys(birdData);
        const hasAllBirds = allBirdTypes
            .filter(birdType => birdType !== "unknown bird")
            .every(birdType => userInventory[birdType] > 0);
        if (targetUser.username == interaction.user.username) {
            if (hasAllBirds) {
                setTimeout(() => {achHandler.grantAchievement(interaction.user.id, 13, interaction);}, 2000);
            }

            if (totalBirds >= 10) {
                setTimeout(() => {achHandler.grantAchievement(interaction.user.id, 19, interaction);}, 2000);
            }

            if (totalBirds >= 100) {
                setTimeout(() => {achHandler.grantAchievement(interaction.user.id, 14, interaction);}, 2000);
            }

            if (totalBirds >= 1000) {
                setTimeout(() => {achHandler.grantAchievement(interaction.user.id, 20, interaction);}, 2000);
            }
            if (totalBirds >= 10000) {
                setTimeout(() => {achHandler.grantAchievement(interaction.user.id, 21, interaction);}, 2000);
            }
        }

        // Send the inventory embed
        await interaction.reply({ embeds: [inventoryEmbed] });
    },
};

function formatCatchTime(totalSeconds) {
  const isNegative = totalSeconds < 0;
  totalSeconds = Math.abs(totalSeconds);

  const time = {
    year: Math.floor(totalSeconds / (365 * 24 * 60 * 60)),
    month: 0,
    week: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0
  };

  let remaining = totalSeconds % (365 * 24 * 60 * 60);
  time.month = Math.floor(remaining / (30 * 24 * 60 * 60));
  remaining %= 30 * 24 * 60 * 60;
  time.week = Math.floor(remaining / (7 * 24 * 60 * 60));
  remaining %= 7 * 24 * 60 * 60;
  time.day = Math.floor(remaining / (24 * 60 * 60));
  remaining %= 24 * 60 * 60;
  time.hour = Math.floor(remaining / (60 * 60));
  remaining %= 60 * 60;
  time.minute = Math.floor(remaining / 60);
  remaining %= 60;

  // Round seconds to the nearest 0.001
  time.second = Math.round((remaining + Number.EPSILON) * 1000) / 1000;

  const parts = Object.entries(time)
    .filter(([_, val]) => val > 0)
    .map(([unit, val]) => `${val} ${unit}${val !== 1 ? 's' : ''}`);

  return (isNegative ? '-' : '') + (parts.length ? parts.join(', ') : '0 seconds');
}

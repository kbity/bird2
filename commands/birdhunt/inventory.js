const { SlashCommandBuilder } = require('discord.js');
const { fileExists } = require('../../birdfslib.js');
const fs = require('fs');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const config = require('../../config.json');

// File path for storing inventories
let inventoryFilePath = './per_user/null.json';

// File path for storing birds data
const birdsFilePath = './data.json';

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

// Load bird data
const birdData = loadJsonFile(birdsFilePath);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your bird inventory or the inventory of another user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose inventory to view'))
        .addStringOption(option => 
            option.setName('type')
                .setDescription('The type of inventory to view')
                .addChoices(
                    { name: 'Bird', value: 'bird' },
                    { name: 'Item', value: 'item' }
                )
        ),

    async execute(interaction) {
        // Get the user ID of the inventory to view
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const inventoryType = interaction.options.getString('type') || "bird";
        const userId = targetUser.id;
        inventoryFilePath = `./per_user/${userId}.json`;
        invexists = await fileExists(inventoryFilePath)

        if (inventoryType !== "bird" && inventoryType !== "item") {
            await interaction.reply("thats not an inventory type, how did you even");
            return;
        }

        // Load inventories
        const inventories = loadInventories();
        
        // Get user's inventory
        const userInventory = inventories.get(inventoryType) || {};

        // Filter out bird types with quantity zero and ignore "fastestTime" and "slowestTime"
        const userBirds = Object.entries(userInventory)
            .filter(([birdType, quantity]) => quantity > 0 && birdType !== 'fastestTime' && birdType !== 'slowestTime' && birdType !== 'bird_money' && birdType !== 'lastclaim');

        // Check if user has no birds
        if (inventoryType == "bird" && userBirds.length === 0) {
            await interaction.reply(`${targetUser.username} has no ${inventoryType}s.`);
            return;
        }

        // Sort bird types by spawn weight (rarest last)
        if (inventoryType == "bird") {
        userBirds.sort(([typeA, _], [typeB, __]) => birdData[typeA].value - birdData[typeB].value);}

        // Calculate total birds
        const totalBirds = userBirds.reduce((sum, [_, quantity]) => sum + quantity, 0);
        const totalValue = userBirds.reduce((sum, [type, quantity]) => sum + quantity * birdData[type].value, 0);

        let descblock = ""
        if (inventoryType == "item") {const moneyEmoji = birdData.bird_money.emoji;
            descblock = `\n${moneyEmoji} Money: ${userInventory.bird_money}\n`}
        if (inventoryType == "bird") {
            descblock = `\n:timer: Fastest Catch: ${formatCatchTime(inventories.get("fastestTime"))}\n:snail: Slowest Catch: ${formatCatchTime(inventories.get("slowestTime"))}\n`
        }

        // Loop through the sorted bird types and quantities in the user's inventory
        let mlgBirds = 0
        for (const [birdType, quantity] of userBirds) {
            const birdEmoji = birdData[birdType].emoji;
            if (birdType == "mlg bird") {
                 mlgBirds = quantity}
            if (birdType == "lowteirbird") {
                 descblock = (descblock + `\n${birdEmoji} **${birdType.slice(0, -4)}** ${quantity}`)}
            else {
                if (inventoryType == "bird") {descblock = (descblock + `\n${birdEmoji} **${birdType.slice(0, -5)}** ${quantity}`)}
            else{descblock = (descblock + `\n${birdEmoji} **${birdType}** ${quantity}`)}}
        }

        // Prepare embed for inventory
        const inventoryEmbed = {
            color: 0xfb5f44,
            title: `${targetUser.username}'s ${inventoryType} Inventory`,
            description: `${config.emojis.bird} Total ${inventoryType}s: ${totalBirds}\n:dollar: Total Value: ${Math.round(totalValue * 100) / 100}${descblock}`,
            fields: []
        };


        await interaction.reply({ embeds: [inventoryEmbed] });

        // Check for achievements
        const allBirdTypes = Object.keys(birdData);
        const hasAllBirds = allBirdTypes
            .filter(birdType => birdType !== "unknown bird")
            .every(birdType => userInventory[birdType] > 0);
        if (targetUser.username == interaction.user.username && inventoryType == "bird") {
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
            if (mlgBirds >= 3) {
                setTimeout(() => {achHandler.grantAchievement(interaction.user.id, 23, interaction);}, 2000);
            }
        }
    },
    userApp: true, // Flag to enable adding user app mode
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

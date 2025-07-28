const { SlashCommandBuilder } = require('discord.js');
const { fileExists } = require('../../birdfslib.js');
const fs = require('fs');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

// Function to load inventories from file
function loadInventories(inventoryFilePath) {
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bal')
        .setDescription('Get Your balance'),
    async execute(interaction) {
        let inventoryFilePath = `./per_user/${interaction.user.id}.json`;
        invexists = await fileExists(inventoryFilePath)
        // Get the user ID of the inventory to view
        const targetUser = interaction.user;
        const userId = targetUser.id;

        // Load inventories
        const inventories = loadInventories(inventoryFilePath);
        
        // Get user's inventory
        const userInventory = inventories.get("item") || {"item":{"bird_money": 0}};

        await interaction.reply(`you have ${userInventory.bird_money} bird moneys`);
    },
    userApp: true, // Flag to enable adding user app mode
};

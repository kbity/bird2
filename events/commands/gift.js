const { Events } = require('discord.js');
const { prefix } = require('../../config.json');
const fs = require('fs');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

const inventoryFilePath = './inventories.json';
const birdsFilePath = './birddata.json';

function loadInventories() {
    try {
        const data = fs.readFileSync(inventoryFilePath);
        return new Map(Object.entries(JSON.parse(data)));
    } catch (err) {
        console.error('Error loading inventories:', err);
        return new Map();
    }
}

function loadJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading file ${filePath}:`, err);
        return null;
    }
}

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

const birdData = loadJsonFile(birdsFilePath);

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {

        if (!message.content.startsWith(prefix)) return;

        const input = message.content.slice(prefix.length).trim();

        // Parse command using regex to handle quotes
        const args = [];
        const regex = /"([^"]+)"|\S+/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            args.push(match[1] || match[0]);
        }

        const command = args.shift()?.toLowerCase();
        if (command !== 'gift') return;

        const target = message.mentions.users.first();
        const birdType = args[1]?.toLowerCase();
        const quantity = parseInt(args[2]) || 1;

        if (!target || !birdType) {
            await message.reply("Usage: `bird!gift @user \"bird name\" [quantity]`");
            return;
        }

        if (quantity <= 0) {
            await message.reply("You cannot gift a non-positive number of birds.");
            return;
        }

        if (!birdData[birdType]) {
            await message.reply(`Invalid bird type: ${birdType}.`);
            return;
        }

        const inventories = loadInventories();
        const senderId = message.author.id;
        const targetId = target.id;

        const senderInventory = inventories.get(senderId) || {};

        if (!senderInventory[birdType] || senderInventory[birdType] < quantity) {
            await message.reply(`You don't have ${quantity} ${birdType}(s) to gift.`);
            return;
        }

        // Remove from sender
        senderInventory[birdType] -= quantity;
        if (senderInventory[birdType] === 0) delete senderInventory[birdType];
        inventories.set(senderId, senderInventory);

        // Add to target
        const recipientInventory = inventories.get(targetId) || {};
        recipientInventory[birdType] = (recipientInventory[birdType] || 0) + quantity;
        inventories.set(targetId, recipientInventory);

        saveInventories(inventories);

        try {
            await message.reply(`${message.author.username} has gifted ${quantity} ${birdData[birdType].emoji} ${birdType}(s) to ${target.username}!`);
        } catch {
            await message.channel.send(`${message.author.username} has gifted ${quantity} ${birdData[birdType].emoji} ${birdType}(s) to ${target.username}!`);
        }

        achHandler.grantAchievement(senderId, 10, message);
        achHandler.grantAchievement(targetId, 11, message, target.username);
    }
};

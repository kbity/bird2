const { Events } = require('discord.js');
const { prefix, clientId } = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const {
    loadJsonFile,
    loadInventories,
    saveInventories
} = require('../../birdfslib');

const birdsFilePath = './data.json';

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.content.startsWith(prefix)) return;

        const input = message.content.slice(prefix.length).trim();

        // Parse args with support for quotes
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

        const senderId = message.author.id;
        const targetId = target.id;

        if (senderId === targetId) {
            await message.reply(`sorry ${message.author.username} but i cannot fulfil this request because i am aroace`);
            achHandler.grantAchievement(senderId, 33, message);
            return;
        }

        if (quantity <= 0) {
            await message.reply("we are NOT doing that incident again, blud.");
            return;
        }

        const birdData = loadJsonFile(birdsFilePath);
        if (!birdData || !birdData[birdType]) {
            await message.reply(`apparently there's no **${birdType}s**.`);
            return;
        }

        const inventoryA = await loadInventories(senderId);
        const inventoryB = await loadInventories(targetId);

        const senderInventory = inventoryA.get("bird") || {};
        const recipientInventory = inventoryB.get("bird") || {};

        if (!senderInventory[birdType] || senderInventory[birdType] < quantity) {
            await message.reply(`You don't have ${quantity} ${birdType}(s) to gift.`);
            return;
        }

        // Deduct from sender
        senderInventory[birdType] -= quantity;
        if (senderInventory[birdType] === 0) {
            delete senderInventory[birdType];
        }
        inventoryA.set("bird", senderInventory);

        // Add to recipient
        recipientInventory[birdType] = (recipientInventory[birdType] || 0) + quantity;
        inventoryB.set("bird", recipientInventory);

        // Save inventories
        await saveInventories(senderId, inventoryA);
        await saveInventories(targetId, inventoryB);

        const birdEmoji = birdData[birdType].emoji || '';
        const giftMsg = `${message.author.username} has gifted ${quantity} ${birdEmoji} ${birdType}(s) to ${target.username}!`;

        try {
            await message.reply(giftMsg);
        } catch {
            await message.channel.send(giftMsg);
        }

        achHandler.grantAchievement(senderId, 10, message);
        achHandler.grantAchievement(targetId, 11, message, target.username);

        if (targetId === clientId) {
            achHandler.grantAchievement(senderId, 30, message);
            if (birdType === 'divine bird' && quantity === 5) {
                achHandler.grantAchievement(senderId, 31, message);
            }
        }
    }
};

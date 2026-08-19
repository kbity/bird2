const { SlashCommandBuilder } = require('discord.js');
const {
    loadJsonFile,
    loadInventories,
    saveInventories
} = require('../../birdfslib.js');

// File path for storing birds data
const birdsFilePath = './data.json';

// Hard-coded gift table
const GIFT_TABLE = {
    christmas25: {
        birds: {
            'christmas bird': 5,
        },
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim-gift')
        .setDescription('Claim a limited-time event gift')
        .addStringOption(option =>
            option
                .setName('gift')
                .setDescription('The gift to claim')
                .setRequired(true)
                .addChoices(
                    { name: 'Christmas 2025', value: 'christmas25' },
                )
        ),

    async execute(interaction) {
        const giftKey = interaction.options.getString('gift');
        const userId = interaction.user.id;

        const birdData = await loadJsonFile(birdsFilePath);
        const inventory = await loadInventories(userId);

        // Ensure events array exists
        const events = inventory.get('events') || [];

        // Check if gift exists
        if (!GIFT_TABLE[giftKey]) {
            await interaction.reply({
                content: `that gift does not exist.`,
                ephemeral: true,
            });
            return;
        }

        // Prevent double-claiming
        if (events.includes(giftKey)) {
            await interaction.reply({
                content: `you have already got this gift.`,
                ephemeral: true,
            });
            return;
        }

        const gift = GIFT_TABLE[giftKey];

        // Add birds
        const birdInventory = inventory.get('bird') || {};

        for (const [birdType, quantity] of Object.entries(gift.birds)) {
            if (!birdData[birdType]) continue;

            birdInventory[birdType] =
                (birdInventory[birdType] || 0) + quantity;
        }

        inventory.set('bird', birdInventory);

        // Mark gift as claimed
        events.push(giftKey);
        inventory.set('events', events);

        // Save inventory
        await saveInventories(userId, inventory);

        // Build response text
        const rewardText = Object.entries(gift.birds)
            .map(
                ([bird, qty]) =>
                    `${qty}× ${birdData[bird]?.emoji || ''} ${bird}`
            )
            .join(', ');

        await interaction.reply(
            `🎁 **Gift claimed!**\nYou received: ${rewardText}`
        );
    },

    userApp: true,
};


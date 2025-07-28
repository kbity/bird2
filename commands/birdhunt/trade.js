const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const {
    loadJsonFile,
    loadInventories,
    saveInventories
} = require('../../birdfslib.js');

let birdData = undefined
const birdsFilePath = './data.json';

// Calculate value of items
function calculateValue(items) {
    let totalValue = 0;
    items.forEach(item => {
        const bird = birdData[item.name];
        if (bird) {
            totalValue += bird.value * item.quantity;
        }
    });
    return totalValue;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Propose a trade with another user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user you want to trade with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sent')
                .setDescription('Your side of the trade (format: bird x quantity, bird x quantity)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('receive')
                .setDescription('The recipient’s side of the trade (format: bird x quantity, bird x quantity)')
                .setRequired(false)),

    async execute(interaction) {
        birdData = await loadJsonFile(birdsFilePath);
        const sender = interaction.user;
        const target = interaction.options.getUser('target');
        const sentItems = interaction.options.getString('sent') || "fine bird x0";
        const receiveItems = interaction.options.getString('receive') || "fine bird x0";

        const inventoryA = await loadInventories(sender.id);
        const inventoryB = await loadInventories(target.id);
        const senderInventory = inventoryA.get("bird") || {};
        const targetInventory = inventoryB.get("bird") || {};

        const parseItems = (itemsString) => {
            return itemsString.split(',').map(item => {
                const parts = item.trim().split(' x');
                if (parts.length < 2) return null;
                const name = parts[0].toLowerCase();
                const quantity = parseInt(parts[1], 10);
                if (isNaN(quantity) || quantity <= 0) return null;
                return { name, quantity };
            }).filter(item => item !== null);
        };

        const sent = parseItems(sentItems);
        const received = parseItems(receiveItems);

        for (const item of [...sent, ...received]) {
            if (!birdData[item.name]) {
                return interaction.reply({ content: `Invalid bird type: ${item.name}.`, ephemeral: true });
            }
        }

        for (const item of sent) {
            if ((senderInventory[item.name] || 0) < item.quantity) {
                return interaction.reply({ content: `You don't have enough ${item.name} to trade.`, ephemeral: true });
            }
        }

        for (const item of received) {
            if ((targetInventory[item.name] || 0) < item.quantity) {
                return interaction.reply({ content: `${target.username} doesn't have enough ${item.name} to trade.`, ephemeral: true });
            }
        }

        const senderValue = calculateValue(sent);
        const targetValue = calculateValue(received);
        const imbalance = targetValue - senderValue;
        const imbalanceString = imbalance > 0 ? `+${imbalance.toFixed(2)}` : imbalance.toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle('Bird Trade Proposal')
            .setDescription(`**${sender.username}** is offering a trade to **${target.username}**`)
            .setColor('#fb5f44')
            .addFields(
                { name: `${sender.username} (Sender)`, value: `${sent.map(item => `${birdData[item.name].emoji} ${item.name} (x${item.quantity})`).join('\n')}\n${targetValue.toFixed(2)}` || 'No birds offered', inline: true },
                { name: `${target.username} (Recipient)`, value: `${received.map(item => `${birdData[item.name].emoji} ${item.name} (x${item.quantity})`).join('\n')}\n${senderValue.toFixed(2)}` || 'No birds offered', inline: true },
                { name: `\u200B`, value: `Imbalance: ${imbalanceString}`, inline: false }
            );

        const acceptButton = new ButtonBuilder()
            .setCustomId(`accept_trade_${interaction.id}`)
            .setLabel('Accept Trade')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(acceptButton);

        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            content: `${target.toString()}, please press the button to accept the trade.`
        });

        const filter = (i) => i.customId === `accept_trade_${interaction.id}` && i.user.id === target.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        let tradeProcessed = false; // To track if trade was already handled

        collector.on('collect', async (i) => {
    if (tradeProcessed) return;

    tradeProcessed = true;

    // Update inventories first (regardless of what happens to the interaction)
    sent.forEach(item => {
        senderInventory[item.name] -= item.quantity;
        if (senderInventory[item.name] <= 0) delete senderInventory[item.name];
    });

    received.forEach(item => {
        targetInventory[item.name] -= item.quantity;
        if (targetInventory[item.name] <= 0) delete targetInventory[item.name];
    });

    sent.forEach(item => {
        targetInventory[item.name] = (targetInventory[item.name] || 0) + item.quantity;
    });

    received.forEach(item => {
        senderInventory[item.name] = (senderInventory[item.name] || 0) + item.quantity;
    });

    await saveInventories(sender.id, inventoryA);
    await saveInventories(target.id, inventoryB);
    collector.stop('success');

    try {
        await i.update({ content: 'Trade success!', components: [] });
        const achievementGranted = achHandler.grantAchievement(sender.id, 22, interaction, sender.username);
        const achievementGranted2 = achHandler.grantAchievement(target.id, 22, interaction, target.username);
    } catch (err) {
        if (err.code === 10062) {
            // Interaction token expired
            console.warn("Interaction token expired; could not update message.");
            await i.channel.send(`${sender.toString()} and ${target.toString()}, your trade completed successfully, but the button interaction expired.`);
            const achievementGranted = achHandler.grantAchievement(sender.id, 22, interaction, sender.username);
            const achievementGranted2 = achHandler.grantAchievement(target.id, 22, interaction, target.username);
        } else {
            console.error("Error updating interaction:", err);
        }
    }
});

    }
};


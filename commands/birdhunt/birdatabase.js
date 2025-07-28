const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birdatabase')
        .setDescription('list of the birds, with their value and spawn chances'),
    async execute(interaction) {
        try {
            // Read the JSON files asynchronously
            const [birdsRaw, birdDataRaw] = await Promise.all([
                fs.readFile(path.join(__dirname, '../../birds.json'), 'utf8'),
                fs.readFile(path.join(__dirname, '../../data.json'), 'utf8')
            ]);

            // Parse the JSON files
            const birds = JSON.parse(birdsRaw); // Array of bird objects from birds.json
            const birdData = JSON.parse(birdDataRaw); // Object mapping bird names to details from birddata.json

            // Filter out birds without matching data or the "unknown bird"
            const validBirds = birds.filter(bird => {
                // Use lowercase for matching since keys in birdData are lowercase
                const key = bird.name.toLowerCase();
                return key in birdData && key !== 'unknown bird';
            });

            // Calculate total weight (chance denominator)
            const totalWeight = validBirds.reduce((acc, bird) => acc + bird.weight, 0);

            // Map each bird to combine data from both files.
            // Calculate chance as (bird.weight / totalWeight) * 100.
            const joinedBirds = validBirds.map(bird => {
                const key = bird.name.toLowerCase();
                return {
                    name: bird.name,
                    emoji: bird.emoji, // This should match the emoji in the birdData as well
                    weight: bird.weight,
                    chance: ((bird.weight / totalWeight) * 100).toFixed(2), // Percentage chance with two decimals
                    rarity: birdData[key].value
                };
            });

            // Sort birds from least valuable/heaviest (common) first to most valuable/lightest (rare) last.
            // In other words, sort ascending by rarity, and if equal use descending weight.
            joinedBirds.sort((a, b) => {
                if (a.rarity === b.rarity) {
                    return b.weight - a.weight;
                }
                return a.rarity - b.rarity;
            });

            // Create a new embed
            const embed = new EmbedBuilder()
                .setColor('#fb5f44') // Set the embed color
                .setTitle(`${config.emojis.bird} The Birdatabase™`)
                .setDescription('List currated by Prof. bird and associates.')

            // Add each bird to the embed
            joinedBirds.forEach(bird => {
                embed.addFields({
                    name: `${bird.emoji} **${bird.name}**`,
                    value: `${bird.chance}% Chance\n${bird.rarity} Value`,
                    inline: true,
                });
            });

            // Send the embed as a reply
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error reading JSON files or processing birds:', error);
            await interaction.reply('An error occurred while loading the bird database.');
        }
    },
  userApp: true, // Flag to enable adding user app mode
};


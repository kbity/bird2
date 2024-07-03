const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

// File path for storing birds data
const birdsFilePath = './birds.json';

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
        .setName('bird')
        .setDescription('Summon the bird!'),
    async execute(interaction) {
        // Load inventories
        let inventories = loadInventories();

        // Array of bird emojis and their corresponding names
        const birds = loadJsonFile(birdsFilePath);

        // Calculate total weight
        const totalWeight = birds.reduce((acc, bird) => acc + bird.weight, 0);

        // Generate a random number between 0 and totalWeight
        let randomNum = Math.floor(Math.random() * totalWeight);

        // Iterate through birds and subtract their weight from randomNum until it becomes <= 0
        let selectedBird;
        for (const bird of birds) {
            randomNum -= bird.weight;
            if (randomNum <= 0) {
                selectedBird = bird;
                break;
            }
        }

        const embed = {
            title: `${selectedBird.emoji} ${selectedBird.name} has appeared!`,
            description: 'Type "bird" to catch it!',
            image: {
                url: 'https://cdn.discordapp.com/avatars/1118256931040149626/3697b20ac069f55bfb074950b400356a.webp?size=4096'
            }
        };

        // Send the initial message
        const message = await interaction.reply({ embeds: [embed] });

        // Set up a filter to listen for the word "bird"
        const filter = m => m.content.toLowerCase() === 'bird' && m.author.id !== interaction.user.id;

        // Set up a collector to wait for someone to say "bird"
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000 }); // Time in milliseconds, here it's set to 15 seconds

        // When someone says "bird", edit the original message to "{username} has caught {bird type}" and update the inventory
        collector.on('collect', async collectedMessage => {
            const user = collectedMessage.author;
            const inventory = inventories.get(user.id) || {};
            inventory[selectedBird.name.toLowerCase()] = (inventory[selectedBird.name.toLowerCase()] || 0) + 1;
            inventories.set(user.id, inventory);

            saveInventories(inventories);

            const caughtEmbed = {
                description: `${collectedMessage.author.username} has caught a ${selectedBird.emoji} ${selectedBird.name}!`,
            };
            await message.edit({ embeds: [caughtEmbed] });
            collector.stop(); // Stop the collector once someone catches the bird
        });

        // If nobody catches the bird within the time limit, end the collector
        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('The bird flew away!');
            }
        });
    },
};


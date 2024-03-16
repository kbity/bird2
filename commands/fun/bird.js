const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing inventories
const inventoryFilePath = './inventories.json';

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bird')
        .setDescription('Summon the bird!'),
    async execute(interaction) {
        // Load inventories
        let inventories = loadInventories();

        // Array of bird emojis and their corresponding names
        const birds = [
            { emoji: '<:finebird:1214018194423947264>', name: 'Fine bird', weight: 1000 },
            { emoji: '<:goodbird:1214018194423947264>', name: 'Good bird', weight: 800 },
            { emoji: '<:rarebird:1218383448176070757>', name: 'Rare bird', weight: 500 },
            { emoji: '<:evilbird:1218386113195147354>', name: 'Evil bird', weight: 250 },
            { emoji: '🐦', name: 'Discord bird', weight: 220 },
            { emoji: '<:coolbird:1214020650918871132>', name: 'Cool bird', weight: 125 },
            { emoji: '<:cartoonbird:1218387018678272161>', name: 'Cartoon bird', weight: 75 },
            { emoji: '<:blackandwhitebird:1218388224737677443>', name: 'Black and White bird', weight: 40 },
            { emoji: '<:8bitbird:1218383149302677535>', name: '8-bit bird', weight: 25 },
            { emoji: '<:goldbird:1214020841625362442>', name: 'Gold bird', weight: 15 },
            { emoji: '<:mythicbird:1218389161942188063>', name: 'Mythical bird', weight: 8 },
            { emoji: '<:amdbird:1218387652974346310>', name: 'AMD bird', weight: 4 },
            { emoji: '<:realbird:1214020424233521192>', name: 'Real bird', weight: 2 },
            { emoji: '<:mlgbird:1218385321490776146>', name: 'MLG bird', weight: 1 }
        ];

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


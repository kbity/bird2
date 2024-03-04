const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bird')
        .setDescription('Summon the bird!'),
    async execute(interaction) {
        // Array of bird emojis and their corresponding names
        const birds = [
            { emoji: '<:finebird:1214018194423947264>', name: 'fine bird' },
            { emoji: '<:realbird:1214020424233521192>', name: 'real bird' },
            { emoji: '<:coolbird:1214020650918871132>', name: 'cool bird' },
            { emoji: '<:goldbird:1214020841625362442>', name: 'gold bird' }
        ];

        // Randomly select a bird from the array
        const randomBird = birds[Math.floor(Math.random() * birds.length)];

        const embed = {
            title: `${randomBird.emoji} ${randomBird.name} has appeared!`,
            description: 'Type "bird" to (not) catch it!',
            image: {
                url: 'https://cdn.discordapp.com/avatars/1118256931040149626/3697b20ac069f55bfb074950b400356a.webp?size=4096'
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};


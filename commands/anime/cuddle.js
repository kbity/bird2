const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const cuddleGifs = require('./gifs/cuddle-gifs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cuddle')
        .setDescription('Cuddle with a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to cuddle')
                .setRequired(true)),

    async execute(interaction) {
        const userToCuddle = interaction.options.getUser('user');

        if (!userToCuddle) {
            return interaction.reply('Please specify a user to cuddle.');
        }

        // Get the member object of the user who triggered the command
        const member = interaction.guild.members.cache.get(interaction.user.id);

        // Select a random cuddle GIF from the hugGifs array
        const randomCuddle = cuddleGifs[Math.floor(Math.random() * cuddleGifs.length)];

        const cuddleEmbed = new EmbedBuilder()
            .setDescription(`**${interaction.user}** cuddles with **${userToCuddle}**`)
            .setImage(randomCuddle);

        // Set the embed color to the user's accent color if available
        if (member?.displayColor) {
            cuddleEmbed.setColor(member.displayColor);
        } else {
            // Default color if the user's accent color is not available
            cuddleEmbed.setColor('#ff0099');
        }

        interaction.reply({ embeds: [cuddleEmbed] });
    },
};


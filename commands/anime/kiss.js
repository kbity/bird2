const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const hugGifs = require('./gifs/kiss-gifs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to kiss')
                .setRequired(true)),

    async execute(interaction) {
        const userToHug = interaction.options.getUser('user');

        if (!userToHug) {
            return interaction.reply('Please specify a user to kiss.');
        }

        let member = null;

        if (interaction.guild) {
            console.log("h");
            // Get the member object of the user who triggered the command
            member = interaction.guild.members.cache.get(interaction.user.id);
        }

        // Select a random hug GIF from the hugGifs array
        const randomHug = hugGifs[Math.floor(Math.random() * hugGifs.length)];

        const hugEmbed = new EmbedBuilder()
            .setDescription(`**${interaction.user}** kisses **${userToHug}**`)
            .setImage(randomHug);

        // Set the embed color to the user's accent color if available
        if (member?.displayColor) {
            hugEmbed.setColor(member.displayColor);
        } else {
            // Default color if the user's accent color is not available
            hugEmbed.setColor('#ff0099');
        }

        interaction.reply({ embeds: [hugEmbed] });
    },
    userApp: true, // Flag to enable adding user app mode
};


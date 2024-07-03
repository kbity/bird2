const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// File path for storing channel information
const channelFilePath = './channels.json';

// Function to load channels from file
function loadChannels() {
    try {
        const data = fs.readFileSync(channelFilePath);
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading channels:', err);
        return {};
    }
}

// Function to save channels to file
function saveChannels(channels) {
    try {
        fs.writeFileSync(channelFilePath, JSON.stringify(channels, null, 4));
    } catch (err) {
        console.error('Error saving channels:', err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autobird')
        .setDescription('Automatically manage bird spawns in this channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Enable automatic bird spawns every 30 minutes')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Disable automatic bird spawns')
        ),

    async execute(interaction) {
        // Check if user is a server admin
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply('You need to be a server administrator to use this command.');
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        // Load channels
        const channels = loadChannels();

        if (subcommand === 'add') {
            // Check if the channel is already set for auto bird spawns
            if (channels[interaction.channel.id]) {
                await interaction.reply('Automatic bird spawns are already enabled in this channel.');
                return;
            }

            // Calculate future spawn time (30 minutes from now)
            const spawnTime = Date.now() + 30 * 60 * 1000;

            // Add the current channel to the channels object with a future spawn timestamp
            channels[interaction.channel.id] = { birdPresent: false, spawnTimestamp: spawnTime };

            // Save the updated channels object
            saveChannels(channels);

            // Respond to the user
            await interaction.reply('Birds will now spawn automatically in this channel every 30 minutes.');
        } else if (subcommand === 'remove') {
            // Check if the channel is not set for auto bird spawns
            if (!channels[interaction.channel.id]) {
                await interaction.reply('Automatic bird spawns are not enabled in this channel.');
                return;
            }

            // Remove automatic bird spawn for this channel
            delete channels[interaction.channel.id];

            // Save the updated channels object
            saveChannels(channels);

            // Respond to the user
            await interaction.reply('Automatic bird spawns have been disabled in this channel.');
        }
    },
};

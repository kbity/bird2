const {
    SlashCommandBuilder
} = require('discord.js');
const {
    loadChannels,
    saveChannels
} = require('../../birdfslib.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birdhunt')
        .setDescription('Automatically manage bird spawns in this channel')
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('Enable automatic bird spawns every 5-15 minutes')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('Disable automatic bird spawns')
        ),

    async execute(interaction) {
        // Check if user is a server admin
        if (!interaction.member.permissions.has('ManageChannels')) {
            await interaction.reply('You need to be a server administrator to use this command.');
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        // Load channels
        const channels = await loadChannels(interaction.guild.id);

        if (subcommand === 'add') {
            if (channels.has(interaction.channel.id)) {
                await interaction.reply('Automatic bird spawns are already enabled in this channel.');
                return;
            }

            const spawnTime = Date.now() + 10 * 60 * 1000;
            channels.set(interaction.channel.id, {
                birdPresent: false,
                spawnTimestamp: spawnTime,
                lastCaught: Date.now()
            });
            await saveChannels(interaction.guild.id, channels);
            await interaction.reply('Birds will now spawn automatically in this channel every 5-15 minutes.');
        } else if (subcommand === 'remove') {
            if (!channels.has(interaction.channel.id)) {
                await interaction.reply('Automatic bird spawns are not enabled in this channel.');
                return;
            }

            channels.delete(interaction.channel.id);
            await saveChannels(interaction.guild.id, channels);
            await interaction.reply('Automatic bird spawns have been disabled in this channel.');
        }
    },
};

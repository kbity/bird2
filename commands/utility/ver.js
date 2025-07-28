const { SlashCommandBuilder } = require('discord.js');
const { version } = require('../../birdfslib.js');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

const REPO_URL = 'https://api.github.com/repos/kbity/bird2/releases/latest';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ver')
        .setDescription('Gets Bird Version'),
    async execute(interaction) {
        try {
            // Dynamically import node-fetch
            const fetch = await import('node-fetch').then(mod => mod.default);

            const response = await fetch(REPO_URL);
            if (!response.ok) {
                throw new Error(`GitHub API request failed: ${response.statusText}`);
            }

            const latestRelease = await response.json();
            const latestVersion = latestRelease.tag_name; // Assume tag_name follows the format "bird233"

            const currentVersionNumber = version.match(/\d+/g).join('');
            const latestVersionNumber = latestVersion.match(/\d+/g).join('');

            const currentMicropatch = version.match(/[a-z]$/i) ? version.match(/[a-z]$/i)[0] : 'a';
            const latestMicropatch = latestVersion.match(/[a-z]$/i) ? latestVersion.match(/[a-z]$/i)[0] : 'a';

            let title, description, color;

            if (currentVersionNumber === latestVersionNumber && currentMicropatch === latestMicropatch) {
                title = `bird ${version}`;
                description = 'This instance is up to date!';
                color = 0x00FF00; // GREEN
            } else if (currentVersionNumber < latestVersionNumber || (currentVersionNumber === latestVersionNumber && currentMicropatch < latestMicropatch)) {
                title = `bird ${version}`;
                description = `This instance is outdated!\nThe latest version is ${latestRelease.name}.\nCheck for updates: https://github.com/kbity/bird2`;
                color = 0xFF0000; // RED
            } else {
                // Current version is ahead of the official repo
                const botId = interaction.client.user.id;
                if (botId === '1118256931040149626') {
                    description = "Mari hasn't updated the repo, please tell her to do so.";
                } else if (botId === '1187610993883349072') {
                    description = "This bot is using a preview version of bird2.";
                } else {
                    description = "This bot might be using a preview version of bird2, or it might be a fork.";
                }
                title = `bird ${version}`;
                color = 0xFFFF00; // YELLOW
            }

            const embed = {
                title,
                description,
                color,
            };

            await interaction.reply({ embeds: [embed] });
		    const achievementGranted = achHandler.grantAchievement(interaction.user.id, 29, interaction);
        } catch (error) {
            console.error('Error fetching latest version:', error);
            await interaction.reply({ content: 'Failed to check the latest version.', ephemeral: true });
        }
    },
    userApp: true, // Flag to enable adding user app mode
};

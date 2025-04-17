const { Events } = require('discord.js');
const { prefix } = require('../../config.json');
const CURRENT_VERSION = 'v2.4.2c';
const REPO_URL = 'https://api.github.com/repos/kbity/bird2/releases/latest';

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (command !== 'ver') return;

        try {
            const fetch = await import('node-fetch').then(mod => mod.default);
            const response = await fetch(REPO_URL);

            if (!response.ok) {
                throw new Error(`GitHub API request failed: ${response.statusText}`);
            }

            const latestRelease = await response.json();
            const latestVersion = latestRelease.tag_name;

            const currentVersionNumber = CURRENT_VERSION.match(/\d+/g).join('');
            const latestVersionNumber = latestVersion.match(/\d+/g).join('');

            const currentMicropatch = CURRENT_VERSION.match(/[a-z]$/i)?.[0] || 'a';
            const latestMicropatch = latestVersion.match(/[a-z]$/i)?.[0] || 'a';

            let title, description, color;

            if (currentVersionNumber === latestVersionNumber && currentMicropatch === latestMicropatch) {
                title = `bird ${CURRENT_VERSION}`;
                description = 'This instance is up to date!';
                color = 0x00FF00; // GREEN
            } else if (
                currentVersionNumber < latestVersionNumber ||
                (currentVersionNumber === latestVersionNumber && currentMicropatch < latestMicropatch)
            ) {
                title = `bird ${CURRENT_VERSION}`;
                description = `This instance is outdated!\nThe latest version is ${latestRelease.name}.\nCheck for updates: https://github.com/kbity/bird2`;
                color = 0xFF0000; // RED
            } else {
                const botId = message.client.user.id;
                if (botId === '1118256931040149626') {
                    description = "Mari hasn't updated the repo, please tell her to do so.";
                } else if (botId === '1187610993883349072') {
                    description = "This bot is using a preview version of bird2.";
                } else {
                    description = "This bot might be using a preview version of bird2, or it might be a fork.";
                }
                title = `bird ${CURRENT_VERSION}`;
                color = 0xFFFF00; // YELLOW
            }

            const embed = {
                title,
                description,
                color,
            };

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching latest version:', error);
            await message.reply('Failed to check the latest version.');
        }
    }
};

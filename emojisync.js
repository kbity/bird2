const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const configPath = './config.json';
const emojisFolderPath = './emojis';

// Initialize the bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers]
});

client.once('ready', async () => {
    console.log('Logged in to Discord as', client.user.tag);

    // Get the bot config
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const minesweeperDir = path.join(emojisFolderPath, 'minesweeper');
    const miscDir = path.join(emojisFolderPath, 'misc');

    // Function to sync emojis from a directory and update the config
    async function syncEmojisFromDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.gif')) {
                const emojiName = file.split('.')[0];
                const fileData = fs.readFileSync(path.join(dir, file));
                const b64 = Buffer.from(fileData).toString('base64');

                try {
                    const response = await axios.post(`https://discord.com/api/v9/applications/${config.clientId}/emojis`, 
                    {
                        name: emojiName,
                        image: `data:image/${file.split('.').pop()};base64,${b64}`
                    },
                    {
                        headers: {
                            'Authorization': `Bot ${config.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const emojiId = response.data.id;
                    console.log(`Uploaded emoji: ${emojiName} with ID: ${emojiId}`);

                    // Update the config with the full emoji code, spoiler emojis if needed
                    const emojiKey = emojiName.replace(/_/g, '');
                    const fullEmojiCode = `<:${emojiName}:${emojiId}>`;
                    if (config.emojis[emojiKey] !== undefined) {
                        // Spoiler emojis for keys "0-8" and "mine"
                        if (/^[0-8]$/.test(emojiKey) || emojiKey === 'mine') {
                            config.emojis[emojiKey] = `||${fullEmojiCode}||`;
                        } else {
                            config.emojis[emojiKey] = fullEmojiCode;
                        }
                    }
                } catch (error) {
                    console.error('Error uploading emoji:', error.response ? error.response.data : error.message);
                }
            }
        }
    }

    // Sync emojis from both directories
    if (fs.existsSync(minesweeperDir)) {
        await syncEmojisFromDir(minesweeperDir);
    } else {
        console.log("Minesweeper emojis directory not found.");
    }

    if (fs.existsSync(miscDir)) {
        await syncEmojisFromDir(miscDir);
    } else {
        console.log("Misc emojis directory not found.");
    }

    // Save the updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    console.log('Emojis synced successfully and config updated.');
    client.destroy();
});

// Log in with the bot token from config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
client.login(config.token);


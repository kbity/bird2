const fs = require('fs');
const axios = require('axios');
const path = require('path');

// List of emoji URLs and their corresponding filenames
const emojis = [
    { name: '1', url: 'https://cdn.discordapp.com/emojis/1139344548083019836.png' },
    { name: '2', url: 'https://cdn.discordapp.com/emojis/1139345260019974214.png' },
    { name: '3', url: 'https://cdn.discordapp.com/emojis/1139350629672833114.png' },
    { name: '4', url: 'https://cdn.discordapp.com/emojis/1139351457112535122.png' },
    { name: '5', url: 'https://cdn.discordapp.com/emojis/1139352253178843218.png' },
    { name: '6', url: 'https://cdn.discordapp.com/emojis/1139352702216851518.png' },
    { name: '7', url: 'https://cdn.discordapp.com/emojis/1139352704091705414.png' },
    { name: '8', url: 'https://cdn.discordapp.com/emojis/1139352255485718678.png' },
    { name: 'DataBlue', url: 'https://cdn.discordapp.com/emojis/1257581952907612160.png' },
    { name: 'DataBonus', url: 'https://cdn.discordapp.com/emojis/1257582047174590527.png' },
    { name: 'DataCorrupt', url: 'https://cdn.discordapp.com/emojis/1257582133833236521.png' },
    { name: 'DataError', url: 'https://cdn.discordapp.com/emojis/1257582212690350112.png' },
    { name: 'DataGray', url: 'https://cdn.discordapp.com/emojis/1257582417384833127.png' },
    { name: 'DataNegitive', url: 'https://cdn.discordapp.com/emojis/1257582418307842069.png' },
    { name: 'DataRandom', url: 'https://cdn.discordapp.com/emojis/1257588777338277939.png' },
    { name: 'DataWin', url: 'https://cdn.discordapp.com/emojis/1257582905530777620.png' },
    { name: '_', url: 'https://cdn.discordapp.com/emojis/1139345030612537375.png' },
    { name: 'f', url: 'https://cdn.discordapp.com/emojis/1139350834778480680.png' },
    { name: 'l', url: 'https://cdn.discordapp.com/emojis/1139351570522329240.png' },
    { name: 'sweepergray', url: 'https://cdn.discordapp.com/emojis/1287184299044503685.png' },
    { name: 'sweeperguy', url: 'https://cdn.discordapp.com/emojis/1287184044311711844.png' },
    { name: 'sweeperguycool', url: 'https://cdn.discordapp.com/emojis/1287185667821932657.png' },
    { name: 'sweeperguyded', url: 'https://cdn.discordapp.com/emojis/1287185668975362158.png' },
    { name: 'x', url: 'https://cdn.discordapp.com/emojis/1139345434054242344.png' }
];

// Ensure the 'emojis' directory exists
const downloadDirectory = path.join(__dirname, 'emojis');
if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory);
}

// Function to download an emoji
async function downloadEmoji(emoji) {
    const filePath = path.join(downloadDirectory, `${emoji.name}.png`);
    const writer = fs.createWriteStream(filePath);

    try {
        const response = await axios({
            url: emoji.url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${emoji.name}: ${error.message}`);
    }
}

// Download all emojis
(async () => {
    console.log('Starting emoji downloads...');

    for (const emoji of emojis) {
        await downloadEmoji(emoji);
        console.log(`Downloaded ${emoji.name}`);
    }

    console.log('All emojis downloaded.');
})();

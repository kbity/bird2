const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const configPath = './config.json';
const dataPath = './data.json';
const birdsPath = './birds.json';
const achsPath = './achs.json';

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const birds = JSON.parse(fs.readFileSync(birdsPath, 'utf8'));
const achs = JSON.parse(fs.readFileSync(achsPath, 'utf8'));

const emojisFolderPath = './emojis';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log('Logged in as', client.user.tag);

    let existingEmojis = [];
    try {
        const res = await axios.get(
            `https://discord.com/api/v9/applications/${config.clientId}/emojis`,
            {
                headers: {
                    Authorization: `Bot ${config.token}`
                }
            }
        );
        existingEmojis = Array.isArray(res.data.items) ? res.data.items : [];
    } catch (err) {
        console.error('Failed to fetch emojis:', err.response?.data || err.message);
        client.destroy();
        return;
    }

    const existingEmojiMap = new Map(existingEmojis.map(e => [e.name, e.id]));

// Modify emojiCode to accept animated flag
function emojiCode(name, id, animated = false) {
    return animated ? `<a:${name}:${id}>` : `<:${name}:${id}>`;
}

// Update updateAllEmojiRefs to detect and replace both static and animated emoji references
function updateAllEmojiRefs(name, id, animated = false) {
    const full = emojiCode(name, id, animated);
    const key = name.replace(/_/g, '');

    // Update config.emojis
    if (config.emojis?.[key] !== undefined) {
        if (/^[0-8]$/.test(key) || key === 'mine') {
            config.emojis[key] = `||${full}||`;
        } else {
            config.emojis[key] = full;
        }
    }

    // Helper to replace emoji references starting with either <:name: or <a:name:
    function replaceEmojiRefs(obj, prop) {
        for (const item of obj) {
            if (item[prop]?.startsWith(`<:${name}:`) || item[prop]?.startsWith(`<a:${name}:`)) {
                item[prop] = full;
            }
        }
    }

    // Update data.json (it's an object, so iterate values)
    for (const entry of Object.values(data)) {
        if (entry.emoji?.startsWith(`<:${name}:`) || entry.emoji?.startsWith(`<a:${name}:`)) {
            entry.emoji = full;
        }
    }

    // Update birds.json
    replaceEmojiRefs(birds, 'emoji');

    // Update achs.json (icon2 property)
    replaceEmojiRefs(achs, 'icon2');
}

async function syncEmojisFromDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (!/\.(png|jpg|gif)$/i.test(file)) continue;

        const emojiName = path.basename(file, path.extname(file));
        const ext = path.extname(file).slice(1).toLowerCase();

        const animated = ext === 'gif';

        if (existingEmojiMap.has(emojiName)) {
            const id = existingEmojiMap.get(emojiName);
            console.log(`↪️  Already exists: ${emojiName}`);
            updateAllEmojiRefs(emojiName, id, animated);
            continue;
        }

        const fileData = fs.readFileSync(path.join(dirPath, file));
        const base64 = Buffer.from(fileData).toString('base64');

        try {
            const res = await axios.post(
                `https://discord.com/api/v9/applications/${config.clientId}/emojis`,
                {
                    name: emojiName,
                    image: `data:image/${ext};base64,${base64}`
                },
                {
                    headers: {
                        Authorization: `Bot ${config.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const newId = res.data.id;
            console.log(`✅ Uploaded: ${emojiName} → ${newId}`);
            updateAllEmojiRefs(emojiName, newId, animated);
        } catch (err) {
            console.error(`❌ Failed to upload ${emojiName}:`, err.response?.data || err.message);
        }
    }
}

    const emojiDirs = fs.readdirSync(emojisFolderPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(emojisFolderPath, dirent.name));

    for (const dir of emojiDirs) {
        console.log(`📁 Syncing from: ${dir}`);
        await syncEmojisFromDir(dir);
    }

    // Save updated files
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
    fs.writeFileSync(birdsPath, JSON.stringify(birds, null, 4));
    fs.writeFileSync(achsPath, JSON.stringify(achs, null, 4));

    console.log('\n✨ All emojis synced & config/data/birds/achs updated.');
    client.destroy();
});

client.login(config.token);


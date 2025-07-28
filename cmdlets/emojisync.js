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

    function emojiCode(name, id) {
        return `<:${name}:${id}>`;
    }

    function updateAllEmojiRefs(name, id) {
        const full = emojiCode(name, id);

        // config.emojis
        const key = name.replace(/_/g, '');
        if (config.emojis?.[key] !== undefined) {
            if (/^[0-8]$/.test(key) || key === 'mine') {
                config.emojis[key] = `||${full}||`;
            } else {
                config.emojis[key] = full;
            }
        }

        // data.json
        for (const entry of Object.values(data)) {
            if (entry.emoji?.startsWith(`<:${name}:`)) {
                entry.emoji = full;
            }
        }

        // birds.json
        for (const bird of birds) {
            if (bird.emoji?.startsWith(`<:${name}:`)) {
                bird.emoji = full;
            }
        }

        // achs.json
        for (const ach of achs) {
            if (ach.icon2?.startsWith(`<:${name}:`)) {
                ach.icon2 = full;
            }
        }
    }

    async function syncEmojisFromDir(dirPath) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (!/\.(png|jpg|gif)$/i.test(file)) continue;

            const emojiName = path.basename(file, path.extname(file));
            const ext = path.extname(file).slice(1);

            if (existingEmojiMap.has(emojiName)) {
                const id = existingEmojiMap.get(emojiName);
                console.log(`↪️  Already exists: ${emojiName}`);
                updateAllEmojiRefs(emojiName, id);
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
                updateAllEmojiRefs(emojiName, newId);
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


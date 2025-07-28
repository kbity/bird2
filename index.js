process.on('uncaughtException', function(exception) {
    console.log(exception);
});

const { fetch, setGlobalDispatcher, Agent } = require('undici')
setGlobalDispatcher(new Agent({
    connect: {
        timeout: 60_000
    }
}))

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { Client, Collection, GatewayIntentBits, GuildMessageReactions } = require('discord.js');
const { emojis, token } = require('./config.json');
const { loadChannels, saveChannels, loadJsonFile } = require('./birdfslib');
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers ] });

client.commands = new Collection();

// Load commands from files
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventItems = fs.readdirSync(eventsPath, { withFileTypes: true });

for (const item of eventItems) {
    if (item.isFile() && item.name.endsWith('.js')) {
        // Load from root
        const filePath = path.join(eventsPath, item.name);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    } else if (item.isDirectory()) {
        // Load from subfolder
        const subfolderPath = path.join(eventsPath, item.name);
        const subFiles = fs.readdirSync(subfolderPath).filter(file => file.endsWith('.js'));

        for (const file of subFiles) {
            const filePath = path.join(subfolderPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}

async function spawnBirds() {
    for (const file of fs.readdirSync("./per_server")) {
        if (file.endsWith(".json")) {
            const channels = await loadChannels(file.slice(0, -5));
            const birds = await loadJsonFile("./birds.json");
            if (!birds || birds.length === 0) {
                console.error('[SPAWN] No birds data loaded.');
                return;
            }

            const now = Date.now();

            for (const [channelId, data] of channels.entries()) {
                try {
                    const channelData = channels.get(channelId);
                    if (channelData.birdPresent) continue;
                    if (!channelData.spawnTimestamp || channelData.spawnTimestamp > now) continue;

                    // Attempt to fetch the channel.
                    const channel = await client.channels.fetch(channelId).catch(err => {
                        console.error(`[SPAWN] Error fetching channel ${channelId}:`, err);
                        return null;
                    });
                    if (!channel) continue;

                    // Weighted random selection.
                    const totalWeight = birds.reduce((acc, bird) => acc + bird.weight, 0);
                    const selectBird = () => {
                        let rand = Math.random() * totalWeight;
                        for (const bird of birds) {
                            rand -= bird.weight;
                            if (rand <= 0) return bird;
                        }
                        return birds[birds.length - 1]; // fallback
                    };

                    const bird1 = selectBird();
                    const spawnTwo = Math.random() < 0.05;
                    const selectedBirds = spawnTwo ? [bird1, selectBird()] : [bird1];

                    // Update channel state safely.
                    const updated = {
                        ...channelData,
                        birdPresent: true,
                        spawnTimestamp: now
                    };

                    if (selectedBirds.length === 1) {
                        updated.currentBird = selectedBirds[0];
                        delete updated.birds;
                    } else {
                        updated.birds = selectedBirds;
                        delete updated.currentBird;
                    }

                    channels.set(channelId, updated);
                    await saveChannels(file.slice(0, -5), channels); // Save right after setting the spawn data

                    // Format embed(s).
                    const embeds = selectedBirds.map(bird => {
                        let birdicon;
                        if (typeof bird.spawnImg !== "undefined") {
                            birdicon = {
                                url: bird.spawnImg
                            };
                        } else {
                            const emojiMatch = bird.emoji.match(/\d+/);
                            if (emojiMatch) {
                                birdicon = {
                                    url: `https://cdn.discordapp.com/emojis/${emojiMatch[0]}.png?size=1024`
                                };
                            } else {
                                birdicon = undefined;
                            }
                        }

                        return {
                            title: `${bird.emoji} ${bird.name} has appeared!`,
                            description: 'Type "bird" to catch it!',
                            image: birdicon,
                            color: 0xfb5f44
                        };
                    });

                    try {
                        await channel.send({
                            embeds
                        });
                    } catch (err) {
                        console.error(`[SPAWN] Failed to send bird embed to ${channelId}: trying again..., ${err}`);
                        try {
                            await channel.send({
                                embeds
                            });
                        } catch (err) {
                            console.error(`[SPAWN] Failed to send bird embed to ${channelId} again: bailing out, ${err}`);
                        }
                    }

                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
}

// Increase interval to reduce potential spamming due to lag
// Set interval to 10 seconds (10000ms) instead of 1 second
setInterval(spawnBirds, 3000);
// setInterval(spawnBirds, 10000);

// Login the client with token
client.login(token);

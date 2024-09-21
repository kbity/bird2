process.on('uncaughtException', function (exception) {
    console.log(exception);
});

const { fetch, setGlobalDispatcher, Agent } = require ('undici')
setGlobalDispatcher(new Agent({ connect: { timeout: 60_000 } }) )

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// File paths for storing data
const channelFilePath = './channels.json';
const inventoryFilePath = './inventories.json';
const birdsFilePath = './birds.json';

// Function to load JSON data from file
async function loadJsonFile(filePath) {
    try {
        const data = await fsp.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading file ${filePath}:`, err);
        return {};
    }
}

// Function to save JSON data to file
async function saveJsonFile(filePath, data) {
    try {
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error saving file ${filePath}:`, err);
    }
}

// Function to load channel data from file
async function loadChannels() {
    const data = await loadJsonFile(channelFilePath);
    return new Map(Object.entries(data || {}));
}

// Function to save channel data to file
async function saveChannels(channels) {
    await saveJsonFile(channelFilePath, Object.fromEntries(channels));
}

// Function to load inventories from file
async function loadInventories() {
    const data = await loadJsonFile(inventoryFilePath);
    return new Map(Object.entries(data || {}));
}

// Function to save inventories to file
async function saveInventories(inventories) {
    await saveJsonFile(inventoryFilePath, Object.fromEntries(inventories));
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Required to read message content
    ]
});

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

// Load events from files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Handler for 'messageCreate' event
client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === 'bird') {
        const channels = await loadChannels();
        const inventories = await loadInventories();

        const channelId = message.channel.id;
        const channelData = channels.get(channelId);

        // Respond only if a bird is present and the message is the first "bird" message after the latest spawned bird
        if (channelData && channelData.birdPresent && !message.reactions.cache.get('<:true:1165438896469975130>')) {
            const birds = await loadJsonFile(birdsFilePath);

            let selectedBird = channelData.currentBird;
            const user = message.author;

            // Check if the current bird is missing or not in birds data
            if (!selectedBird || !birds.find(bird => bird.name === selectedBird.name)) {
                selectedBird = { name: 'Unknown Bird', emoji: '❓' };
            }

            // Update user inventory
            const inventory = inventories.get(user.id) || {};
            inventory[selectedBird.name.toLowerCase()] = (inventory[selectedBird.name.toLowerCase()] || 0) + 1;
            inventories.set(user.id, inventory);
            await saveInventories(inventories);

            // Send message about catching the bird
            const caughtEmbed = {
                description: `${user.username} has caught a ${selectedBird.emoji} ${selectedBird.name}!`,
            };
            await message.channel.send({ embeds: [caughtEmbed] });

            // Calculate random spawn time between 3 and 30 minutes (in milliseconds)
            const now = Date.now();
            const spawnTime = now + Math.random() * (30 * 60 * 1000 - 3 * 60 * 1000) + 3 * 60 * 1000;

            // Mark that the bird has been caught and set the next spawn time
            channels.set(channelId, { birdPresent: false, spawnTimestamp: spawnTime });
            await saveChannels(channels);

            // React to the message with a true
            message.react('<:true:1165438896469975130>')
                .catch(error => console.error("Failed to add reaction:", error));
        }
    }

    if (message.content.toLowerCase().includes('bird')) {
        message.react('<:bird:1214018194423947264>')
            .catch(error => console.error("Failed to add reaction:", error));
    }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'mari!sex') {
    message.channel.send("👁️ **attention!** 👁️\n👺 {you have} **insulted the president of chicken coop** 👺\n🚶‍♀️ {please} **leave the premises at once** 🚶‍♂️\n💩👹👾 {or face the might of our nuclear arsenal} 💩👹👾");
  }
});

// Bird spawning function
async function spawnBirds() {
    const channels = await loadChannels();
    const birds = await loadJsonFile(birdsFilePath);

    if (!birds) {
        console.error('No birds data loaded.');
        return;
    }

    const now = Date.now();
    let channelsUpdated = false;

    for (const [channelId, data] of channels.entries()) {
        // Check if the bot has access to the channel
        const channel = await client.channels.fetch(channelId).catch(err => {
            console.error(`Error fetching channel ${channelId}:`, err);
            return null;
        });

        if (!channel) continue; // Skip if channel fetch fails

        // Skip channels where a bird is already present
        if (data.birdPresent) {
            console.log(`Bird already present in channel ${channelId}, skipping...`);
            continue;
        }

        // Check if it's time to spawn a new bird
        if (data.spawnTimestamp <= now) {
            console.log(`Spawning new bird in channel ${channelId}...`);

            // Randomly select a bird based on weight
            const totalWeight = birds.reduce((acc, bird) => acc + bird.weight, 0);
            let randomNum = Math.floor(Math.random() * totalWeight);
            let selectedBird;
            for (const bird of birds) {
                randomNum -= bird.weight;
                if (randomNum <= 0) {
                    selectedBird = bird;
                    break;
                }
            }

            // Create and send the embed message for bird appearance
            const embed = {
                title: `${selectedBird.emoji} ${selectedBird.name} has appeared!`,
                description: 'Type "bird" to catch it!',
                image: {
                    url: 'https://cdn.discordapp.com/avatars/1118256931040149626/3697b20ac069f55bfb074950b400356a.webp?size=4096'
                }
            };

            try {
                await channel.send({ embeds: [embed] });

                // Update the channel data to reflect the bird spawn
                channels.set(channelId, {
                    birdPresent: true,
                    currentBird: selectedBird,
                    spawnTimestamp: now + Math.random() * (30 * 60 * 1000 - 3 * 60 * 1000) + 3 * 60 * 1000 // Random spawn time for next bird
                });

                channelsUpdated = true;
            } catch (error) {
                console.error(`Error sending message to channel ${channelId}:`, error);
            }
        }
    }

    // Save channels data only if there were updates
    if (channelsUpdated) {
        await saveChannels(channels);
    }
}

// Increase interval to reduce potential spamming due to lag
// Set interval to 10 seconds (10000ms) instead of 1 second
//setInterval(spawnBirds, 10000);
setInterval(spawnBirds, 3000);

// Login the client with token
client.login(token);

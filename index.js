process.on('uncaughtException', function (exception) {
    console.log(exception);
});

const { fetch, setGlobalDispatcher, Agent } = require ('undici')
setGlobalDispatcher(new Agent({ connect: { timeout: 60_000 } }) )

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { emojis, token } = require('./config.json');
const AchievementHandler = require('./achievementHandler');
const marikov = require('./marikov');
const achHandler = new AchievementHandler();

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
    if (message.content.toLowerCase() === 'cat') {
        const channels = await loadChannels();
        const channelId = message.channel.id;
        const channelData = channels.get(channelId);
        if (channelData && channelData.birdPresent) {
            const achievementGranted = achHandler.grantAchievement(message.author.id, 12, message);
        }
    }

    if (message.content.toLowerCase() === 'evil mfs') {
        const channels = await loadChannels();
        const channelId = message.channel.id;
        const channelData = channels.get(channelId);
        
        if (channelData && channelData.birdPresent) {
            let selectedBird = channelData.currentBird;
            
            if (selectedBird && selectedBird.name.toLowerCase() === 'evil bird') {
                const achievementGranted = achHandler.grantAchievement(message.author.id, 16, message);
            }
        }
    }

    if (message.content.toLowerCase() === 'bird') {
        const channels = await loadChannels();
        const inventories = await loadInventories();

        const channelId = message.channel.id;
        const channelData = channels.get(channelId);

        if (channelData && channelData.birdPresent && !message.reactions.cache.get(emojis.catch)) {
            const birds = await loadJsonFile(birdsFilePath);

            let selectedBird = channelData.currentBird;
            const user = message.author;

            if (!selectedBird || !birds.find(bird => bird.name === selectedBird.name)) {
                selectedBird = { name: 'Unknown Bird', emoji: '❓' };
            }

            const inventory = inventories.get(user.id) || {};
            inventory[selectedBird.name.toLowerCase()] = (inventory[selectedBird.name.toLowerCase()] || 0) + 1;

const spawnTimeA = channelData.spawnTimestamp
const catchTime = (Date.now() - spawnTimeA) / 1000; // time in seconds since the bird spawned

// Update inventory fastest/slowest time
if (!inventory.fastestTime || catchTime < inventory.fastestTime) {
    inventory.fastestTime = catchTime;
}

if (!inventory.slowestTime || catchTime > inventory.slowestTime) {
    inventory.slowestTime = catchTime;
}

// Save the inventory
inventories.set(user.id, inventory);
await saveInventories(inventories);

// Send the caught bird message
const caughtEmbed = {
    description: `${user.username} has caught a ${selectedBird.emoji} ${selectedBird.name}!!\ncatching took ${catchTime} seconds!!\nyou now have ${inventory[selectedBird.name.toLowerCase()]} birds of that variety!!`,
};
await message.channel.send({ embeds: [caughtEmbed] });

// Grant the achievement
const userId = message.author.id;
const achievementGranted = achHandler.grantAchievement(userId, 2, message);

// Schedule the next bird spawn, only after the catch is processed
const spawnTimeB = Date.now() + Math.random() * (30 * 60 * 1000 - 3 * 60 * 1000) + 3 * 60 * 1000;
channels.set(channelId, { birdPresent: false, spawnTimestamp: spawnTimeB }); // schedule future spawn
await saveChannels(channels);

// React to the catch message
message.react(emojis.catch)
    .catch(error => console.error("Failed to add reaction:", error));
        }
    }

    if (message.content.toLowerCase().includes('bird')) {
        message.react(emojis.bird);
        const userId = message.author.id;
        const achievementGranted = achHandler.grantAchievement(userId, 1, message);
    }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'mari!sex') {
    message.channel.send("👁️ **attention!** 👁️\n👺 {you have} **insulted the president of chicken coop** 👺\n🚶‍♀️ {please} **leave the premises at once** 🚶‍♂️\n💩👹👾 {or face the might of our nuclear arsenal} 💩👹👾");
  }

  if (message.content.toLowerCase() === 'bird!i_visited_website') {
        const userId = message.author.id;
        const achievementGranted = achHandler.grantAchievement(userId, 4, message);
  }

  if (message.content.toLowerCase() === 'bird!mari_is_cute') {
        const userId = message.author.id;
        const achievementGranted = achHandler.grantAchievement(userId, 5, message);
  }

  if (message.content.toLowerCase().includes('<@1225905087352672298>')) {
        const userId = message.author.id;
        const achievementGranted = achHandler.grantAchievement(userId, 6, message);
  }
});

client.on('messageCreate', async (message) => {
    // Reload marikovdb.json every time a message is received
    let marikovdb;
    try {
        marikovdb = JSON.parse(fs.readFileSync(path.join(__dirname, 'marikovdb.json')));
    } catch (error) {
        console.error('Error reading marikovdb.json:', error);
        marikovdb = { channels: [], optedOutUsers: [] };  // Fallback in case of error
    }

    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Automatically respond if the message is in a channel listed in marikovdb.json
    const isAutoRespondChannel = marikovdb.channels.includes(message.channel.id);

    // Check if the bot is mentioned or if it's in an auto-respond channel
    if (message.mentions.has(client.user) || isAutoRespondChannel) {
        // Filter out the bot mention(s) from the message
        const cleanMessage = message.content.replaceAll(`<@${client.user.id}>`, '').trim();

        // If there's no extra content and it's a mention, respond with a default message
        if (cleanMessage.length === 0 && message.mentions.has(client.user)) {
            message.channel.send("uhh hello i guess :3");
            return;
        }

        try {
            // Use the marikov generator to generate a response based on the user's input, omitting any mentions
            const response = await marikov.generateMarkovResponse(cleanMessage.replace(/<@!?[0-9]+>/g, ''));  // Strip mentions
            await message.channel.send(response);  // Send the generated response to the channel

            // Log the cleaned message along with user ID and mention to corpus.txt if user is not opted out
            if (!marikovdb.optedOutUsers.includes(message.author.id) && cleanMessage.length > 0) {
                const logEntry = `${cleanMessage} <@${message.author.id}>\n`;
                fs.appendFile('corpus.txt', logEntry, (err) => {
                    if (err) {
                        console.error('Error writing to corpus.txt:', err);
                    } else {
                        console.log('Message logged to corpus.txt');
                    }
                });
            }
        } catch (error) {
            console.error('Error generating response:', error);
            message.channel.send('Sorry, something went wrong while generating a response.');
        }
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
            continue;
        }

        // Check if it's time to spawn a new bird
        if (data.spawnTimestamp <= now) {
            // Randomly select a bird based on weight
            const totalWeight = birds.reduce((acc, bird) => acc + bird.weight, 0);
            let randomNum = Math.ceil(Math.random() * totalWeight);
            let selectedBird;
            for (const bird of birds) {
                randomNum -= bird.weight;
                if (randomNum <= 0) {
                    selectedBird = bird;
                    break;
                }
            }

            // Create and send the embed message for bird appearance
            const emojiId = selectedBird.emoji.match(/\d+/)[0];
            const embed = {
                title: `${selectedBird.emoji} ${selectedBird.name} has appeared!`,
                description: 'Type "bird" to catch it!',
                image: {
                    url: `https://cdn.discordapp.com/emojis/${emojiId}.png?size=1024`
                }
            };

            try {
                await channel.send({ embeds: [embed] });

                // Update the channel data to reflect the bird spawn
                channels.set(channelId, {
                    birdPresent: true,
                    currentBird: selectedBird,
                    spawnTimestamp: now
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

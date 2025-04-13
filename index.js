process.on('uncaughtException', function(exception) {
    console.log(exception);
});

const {
    fetch,
    setGlobalDispatcher,
    Agent
} = require('undici')
setGlobalDispatcher(new Agent({
    connect: {
        timeout: 60_000
    }
}))

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const {
    Client,
    Collection,
    GatewayIntentBits
} = require('discord.js');
const {
    emojis,
    token
} = require('./config.json');
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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
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

    if (message.content.toLowerCase() === 'bird') {catchingFuncion(message)}

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

    if (message.content.toLowerCase().includes('hedron')) {
        const userId = message.author.id;
        const achievementGranted = achHandler.grantAchievement(userId, 18, message);
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

client.on('messageCreate', async(message) => {
    // Reload marikovdb.json every time a message is received
    let marikovdb;
    try {
        marikovdb = JSON.parse(fs.readFileSync(path.join(__dirname, 'marikovdb.json')));
    } catch (error) {
        console.error('Error reading marikovdb.json:', error);
        marikovdb = {
            channels: [],
            optedOutUsers: []
        }; // Fallback in case of error
    }

    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Automatically respond if the message is in a channel listed in marikovdb.json
    const isAutoRespondChannel = marikovdb.channels.includes(message.channel.id);

    // Check if the bot is mentioned or if it's in an auto-respond channel
    if (message.mentions.has(client.user) || isAutoRespondChannel) {
        // Filter out all mentions from the message
        const cleanMessage = message.content.replace(/<@!?[0-9]+>/g, '').replace(/@everyone|@here/g, '').trim();

        // If there's no extra content and it's a mention, respond with a default message
        if (cleanMessage.length === 0 && message.mentions.has(client.user)) {
            message.channel.send("uhh hello i guess :3");
            return;
        }

        try {
            // Use the marikov generator to generate a response based on the user's input, omitting any mentions
            let response = await marikov.generateMarkovResponse(cleanMessage); // Strip mentions
            response = response.replace(/<@!?[0-9]+>/g, ''); // Strip mentions from output
            await message.channel.send(response); // Send the generated response to the channel

            // Log the cleaned message along with user ID and mention to corpus.txt if user is not opted out
            if (!marikovdb.optedOutUsers.includes(message.author.id) && cleanMessage.length > 0) {
                const logEntry = `${cleanMessage} <@${message.author.id}>\n`;
                fs.appendFile('corpus.txt', logEntry, (err) => {
                    if (err) {
                        console.error('Error writing to corpus.txt:', err);
                    }
                });
            }
        } catch (error) {
            console.error('Error generating response:', error);
            message.channel.send('wuh??');
        }
    }
});

async function catchingFuncion(message) {
    const channels = await loadChannels();
    const inventories = await loadInventories();

    const channelId = message.channel.id;
    const channelData = channels.get(channelId);

    if (!channelData || (!channelData.birdPresent && !channelData.birds)) {
        await message.react(emojis.fail);
        return;
    }

    const birdsData = await loadJsonFile(birdsFilePath);
    const user = message.author;
    let caughtBirds = [];

    if (channelData.birds && Array.isArray(channelData.birds) && channelData.birds.length > 0) {
        caughtBirds = [...channelData.birds];
        channelData.birdPresent = false;
        delete channelData.birds;
    } else if (channelData.currentBird) {
        caughtBirds = [channelData.currentBird];
        channelData.birdPresent = false;
        delete channelData.currentBird;
    } else {
        caughtBirds = [{ name: 'Unknown Bird', emoji: '❓' }];
    }

    channels.set(channelId, channelData);
    await saveChannels(channels);

    const inventory = inventories.get(user.id) || {};
    const spawnTimeA = channelData.spawnTimestamp;
    const catchTime = (Date.now() - spawnTimeA) / 1000;

    for (const bird of caughtBirds) {
        const birdName = bird.name.toLowerCase();
        inventory[birdName] = (inventory[birdName] || 0) + 1;
    }

    if (!inventory.fastestTime || catchTime < inventory.fastestTime) {
        inventory.fastestTime = catchTime;
    }
    if (!inventory.slowestTime || catchTime > inventory.slowestTime) {
        inventory.slowestTime = catchTime;
    }

    inventories.set(user.id, inventory);
    await saveInventories(inventories);

    const caughtDescriptions = caughtBirds.map(b => `${b.emoji} ${b.name}`).join(' and ');
    const countsText = caughtBirds.map(b => `you now have ${inventory[b.name.toLowerCase()]} ${b.name}(s)`).join('\n');

    const caughtEmbed = {
        description: `${user.username} has caught ${caughtDescriptions}!!\ncatching took ${catchTime} seconds!!\n${countsText}`
    };

    await message.channel.send({ embeds: [caughtEmbed] });

    const userId = user.id;
    achHandler.grantAchievement(userId, 2, message);

    console.log(`Previous spawn time: ${spawnTimeA}, Catch time: ${catchTime}s`);

    function getFutureSpawnTime(minMinutes = 5, maxMinutes = 15) {
        const minMs = minMinutes * 60000;
        const maxMs = maxMinutes * 60000;
        return Date.now() + (Math.random() * (maxMs - minMs)) + minMs;
    }

    const spawnTimeB = getFutureSpawnTime();
    console.log(`Scheduling next spawn at: ${new Date(spawnTimeB).toLocaleString()}`);

    channels.set(channelId, {
        birdPresent: false,
        spawnTimestamp: spawnTimeB
    });
    await saveChannels(channels);

    message.react(emojis.catch).catch(err => console.error("Failed to add reaction:", err));
}

// A simple in-memory lock object keyed by channel IDs
const channelLocks = new Map();

async function acquireLock(channelId) {
  // If a lock already exists, wait for it to be released.
  while (channelLocks.get(channelId)) {
    // Wait a little bit (you may adjust the delay)
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  // Acquire the lock
  channelLocks.set(channelId, true);
}

function releaseLock(channelId) {
  channelLocks.delete(channelId);
}


async function spawnBirds() {
  const channels = await loadChannels();
  const birds = await loadJsonFile(birdsFilePath);
  if (!birds || birds.length === 0) {
    console.error('[SPAWN] No birds data loaded.');
    return;
  }

  const now = Date.now();
  let channelsUpdated = false;

  for (const [channelId, data] of channels.entries()) {
    await acquireLock(channelId);
    try {
      // Re-read the state data within the lock.
      const channelData = channels.get(channelId);
      // Skip if a bird is already present.
      if (channelData.birdPresent) continue;
      // Skip if spawn time hasn't passed yet.
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
      const spawnTwo = Math.random() < 0.5;
      const selectedBirds = spawnTwo ? [bird1, selectBird()] : [bird1];

      // Format embed(s).
      const embeds = selectedBirds.map(bird => ({
        title: `${bird.emoji} ${bird.name} has appeared!`,
        description: 'Type "bird" to catch it!',
        image: bird.emoji.match(/\d+/)
          ? {
              url: `https://cdn.discordapp.com/emojis/${bird.emoji.match(/\d+/)[0]}.png?size=1024`
            }
          : undefined,
      }));

      try {
        await channel.send({ embeds });
      } catch (err) {
        console.error(`[SPAWN] Failed to send bird embed to ${channelId}:`, err);
        continue; // even if the sending fails, we want to release the lock
      }

      // Update channel state safely.
      const updated = { ...channelData };
      updated.birdPresent = true;
      updated.spawnTimestamp = now;

      // Store as an array or single bird for compatibility.
      if (selectedBirds.length === 1) {
        updated.currentBird = selectedBirds[0];
        delete updated.birds;
      } else {
        updated.birds = selectedBirds;
        delete updated.currentBird;
      }

      channels.set(channelId, updated);
      channelsUpdated = true;

      console.log(
        `[SPAWN] Spawned ${selectedBirds.map(b => b.name).join(', ')} in channel ${channelId}`
      );
    } finally {
      // Always release the lock regardless of success or failure.
      releaseLock(channelId);
    }
  }

  if (channelsUpdated) {
    await saveChannels(channels);
  }
}

// Increase interval to reduce potential spamming due to lag
// Set interval to 10 seconds (10000ms) instead of 1 second
//setInterval(spawnBirds, 10000);
setInterval(spawnBirds, 10000);

// Login the client with token
client.login(token);

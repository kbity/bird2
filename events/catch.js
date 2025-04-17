const { Events } = require('discord.js');
const { emojis } = require('../config.json');
const AchievementHandler = require('../achievementHandler');
const achHandler = new AchievementHandler();
const {
    loadChannels,
    saveChannels,
    loadInventories,
    saveInventories,
    loadJsonFile,
    birdsFilePath
} = require('../birdfslib');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.content.toLowerCase() === 'cat') {
            const channels = await loadChannels();
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData && channelData.birdPresent) {
                achHandler.grantAchievement(message.author.id, 12, message);
            }
        }

        if (message.content.toLowerCase() === 'evil mfs') {
            const channels = await loadChannels();
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData?.birdPresent && channelData.currentBird?.name.toLowerCase() === 'evil bird') {
                achHandler.grantAchievement(message.author.id, 16, message);
            }
        }

        if (message.content.toLowerCase() === 'bird') {
            catchingFuncion(message); // remains here
        }
    }
};

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
    const countsText = caughtBirds.map(b => `you now have ${inventory[b.name.toLowerCase()]} ${b.name}s!!`).join('\n');

    const caughtEmbed = {
        description: `${user.username} has caught ${caughtDescriptions}!!\ncatching took ${formatCatchTime(catchTime)}!!\n${countsText}`
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

function formatCatchTime(totalSeconds) {
  const isNegative = totalSeconds < 0;
  totalSeconds = Math.abs(totalSeconds);

  const time = {
    year: Math.floor(totalSeconds / (365 * 24 * 60 * 60)),
    month: 0,
    week: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0
  };

  let remaining = totalSeconds % (365 * 24 * 60 * 60);
  time.month = Math.floor(remaining / (30 * 24 * 60 * 60));
  remaining %= 30 * 24 * 60 * 60;
  time.week = Math.floor(remaining / (7 * 24 * 60 * 60));
  remaining %= 7 * 24 * 60 * 60;
  time.day = Math.floor(remaining / (24 * 60 * 60));
  remaining %= 24 * 60 * 60;
  time.hour = Math.floor(remaining / (60 * 60));
  remaining %= 60 * 60;
  time.minute = Math.floor(remaining / 60);
  remaining %= 60;

  // Round seconds to the nearest 0.001
  time.second = Math.round((remaining + Number.EPSILON) * 1000) / 1000;

  const parts = Object.entries(time)
    .filter(([_, val]) => val > 0)
    .map(([unit, val]) => `${val} ${unit}${val !== 1 ? 's' : ''}`);

  return (isNegative ? '-' : '') + (parts.length ? parts.join(', ') : '0 seconds');
}

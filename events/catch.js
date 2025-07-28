const { Events } = require('discord.js');
const { emojis, minSpawnTime, maxSpawnTime } = require('../config.json');
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
            const channels = await loadChannels(message.guild.id);
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData && channelData.birdPresent) {
                await message.react(emojis.wronganimal)
                achHandler.grantAchievement(message.author.id, 12, message);
            }
        }

        if (message.content.toLowerCase() === 'evil mfs') {
            const channels = await loadChannels(message.guild.id);
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData?.birdPresent && channelData.currentBird?.name.toLowerCase() === 'evil bird') {
                achHandler.grantAchievement(message.author.id, 16, message);
            }
        }

        if (message.content.toLowerCase().includes("quine")) {
            const channels = await loadChannels(message.guild.id);
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData?.birdPresent && channelData.currentBird?.name.toLowerCase() === 'professor bird') {
                await message.reply("https://youtu.be/frorGTdQBkI");
            }
        }


        if (message.content.toLowerCase() === 'bird') {
            catchingFuncion(message); // remains here
        }
    }
};

async function catchingFuncion(message) {
    const channels = await loadChannels(message.guild.id);
    const inventories = await loadInventories(message.author.id);

    const channelId = message.channel.id;
    const channelData = channels.get(channelId);

    if (!channelData) {
        return;
    }

    if (!channelData.birdPresent && !channelData.birds) {
        await message.react(emojis.fail);
        return;
    }

    const birdsData = await loadJsonFile("./birds.json");
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
    await saveChannels(message.guild.id, channels);

    const inventory = inventories.get("bird") || {};
    const spawnTimeA = channelData.spawnTimestamp;
    const catchTime = (Date.now() - spawnTimeA) / 1000;

    const spawnTimeB = getFutureSpawnTime();

    channels.set(channelId, {
        birdPresent: false,
        spawnTimestamp: spawnTimeB,
        lastCaught: Date.now()
    });
    await saveChannels(message.guild.id, channels);

    for (const bird of caughtBirds) {
        const birdName = bird.name.toLowerCase();
        inventory[birdName] = (inventory[birdName] || 0) + 1;
    }

    if (!inventories.get("fastestTime") || catchTime < inventories.get("fastestTime")) {
        inventories.set("fastestTime", catchTime);
    }

    if (!inventories.get("slowestTime") || catchTime > inventories.get("slowestTime")) {
        inventories.set("slowestTime", catchTime);
    }

    inventories.set("bird", inventory);
    await saveInventories(user.id, inventories);

    const caughtDescriptions = caughtBirds.map(b => `${b.emoji} ${b.name}`).join(' and ');
    let countsText = caughtBirds.map(b => ithinkieatsandsometimes(b,inventory)).join('\n');
    let descFormat = `${user.username} has caught ${caughtDescriptions}!!\ncatching took ${formatCatchTime(catchTime)}!!\n`
    if (caughtBirds.length == 1) {
      const b = caughtBirds.at(0)
      if (typeof b.catchmsg !== 'undefined')
        descFormat = `${eval(b.catchmsg)}`
    }

    const caughtEmbed = {
      description: `${descFormat}${countsText}`,
      color: 0xfb5f44
    };

    try {await message.channel.send({ embeds: [caughtEmbed] });} catch(err) {try{await message.channel.send({ embeds: [caughtEmbed] });} catch(err) {console.log(`failed to send catch message twice, ${err}`)}}

    const userId = user.id;
    achHandler.grantAchievement(userId, 2, message);
    if (catchTime <= 15) {achHandler.grantAchievement(userId, 24, message);}
    if (catchTime >= 3600) {achHandler.grantAchievement(userId, 25, message);}

    function getFutureSpawnTime(minMinutes = minSpawnTime, maxMinutes = maxSpawnTime) {
        const minMs = minMinutes * 60000;
        const maxMs = maxMinutes * 60000;
        return Date.now() + (Math.random() * (maxMs - minMs)) + minMs;
    }

    message.react(emojis.catch).catch(err => console.error("Failed to add reaction:", err));
}

function ithinkieatsandsometimes(b,inventory) {
    let hingeythingey = `you now have ${inventory[b.name.toLowerCase()]} ${b.name}s!!`
    if (typeof b.countmsg !== 'undefined')
        {hingeythingey = eval(b.countmsg)}
    return hingeythingey
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

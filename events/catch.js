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

const birdtypos = ["bieds", "bied", "biresd", "bir", "brd", "birdd", "brid", "ird", "bid", "nird", "bord", "biod", "bir]d", "biod", "burd", "birod", "bitk", "birde", "birkd", "bikdf", "bigftke", "biord", "bdirc", "brid:", "bire", "birf", "bitd", "bitf", "vird", "birr", "birs", "gird", "bies", "bird\\", "hbird", "тщка"]

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (birdtypos.includes(message.content.toLowerCase())) {
            achHandler.grantAchievement(message.author.id, 36, message);
        }

        if (message.content.toLowerCase() === 'cat') {
            const channels = await loadChannels(message.guild.id);
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData && channelData.birdPresent) {
                await message.react(emojis.wronganimal)
                achHandler.grantAchievement(message.author.id, 12, message);
            }
        }

        if (message.content === 'The bird flew away!') {
            const channels = await loadChannels(message.guild.id);
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData && channelData.birdPresent) {
                achHandler.grantAchievement(message.author.id, 37, message);
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
                achHandler.grantAchievement(message.author.id, 41, message);
            }
        }

        if (message.content.toLowerCase().includes(' bird')) {
            const channels = await loadChannels(message.guild.id);
            const channelId = message.channel.id;
            const channelData = channels.get(channelId);
            if (channelData?.birdPresent && channelData.currentBird?.name.toLowerCase() === message.content.toLowerCase()) {
                achHandler.grantAchievement(message.author.id, 34, message);
            }
        }


        if (message.content.toLowerCase() === 'bird') {
            catchingFuncion(message); // remains here
        } else if (message.content.toLowerCase().includes('bird')) {
            message.react(emojis.bird);
            const userId = message.author.id;
            const achievementGranted = achHandler.grantAchievement(userId, 1, message);
        }
    }
};

function hexToInt(hex) {
    return parseInt(hex.replace('#', ''), 16);
}

async function catchingFuncion(message) {
    if (message.author.bot) return;
    const channels = await loadChannels(message.guild.id);
    const inventories = await loadInventories(message.author.id);

    const channelId = message.channel.id;
    const channelData = channels.get(channelId);

    if (!channelData) {
        message.react(emojis.bird);
        const userId = message.author.id;
        const achievementGranted = achHandler.grantAchievement(userId, 1, message);
        return;
    }

    if (!channelData.birdPresent && !channelData.birds) {
        await message.react(emojis.fail);
        return;
    }

    const birdsData = await loadJsonFile("./birds.json");
    const user = message.author;
    let caughtBirds = [];
    let birdcolor = '#fb5f44';

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
    let catchmoji = emojis.catch
    const caughtDescriptions = caughtBirds.map(b => `${b.emoji} ${b.name}`).join(' and ');
    let countsText = caughtBirds.map(b => ithinkieatsandsometimes(b,inventory)).join('\n');
    let descFormat = `${user.username} has caught ${caughtDescriptions}!!\ncatching took ${formatCatchTime(catchTime)}!!\n`
    const b = caughtBirds.at(0)
    if (typeof b.color !== "undefined")
      birdcolor = b.color
    if (typeof b.class !== "undefined")
      if (b.class === "uncommon") {catchmoji = emojis.catchuc}
      if (b.class === "rare") {catchmoji = emojis.catchra}
      if (b.class === "epic") {catchmoji = emojis.catchep}
    if (caughtBirds.length == 1) {
      if (typeof b.catchmsg !== 'undefined')
        descFormat = `${eval(b.catchmsg)}`
    }

    const caughtEmbed = {
      description: `${descFormat}${countsText}`,
      color: hexToInt(birdcolor)
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

    message.react(catchmoji).catch(err => console.error("Failed to add reaction:", err));

    if (message.attachments.size > 0) {
      achHandler.grantAchievement(userId, 35, message);
    }
    if (caughtBirds.length == 2) {
      achHandler.grantAchievement(userId, 38, message);
        const bsnames = caughtBirds.map(bird => bird.name);
        if (bsnames.includes("Good bird") && bsnames.includes("Evil bird")) {
          achHandler.grantAchievement(userId, 39, message);
        }
    }
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

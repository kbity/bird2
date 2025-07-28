const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const BIRD_DATA_PATH = './data.json';
const USER_DATA_DIR = './per_user';

const birdData = loadJsonFile(BIRD_DATA_PATH);

function loadJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading file ${filePath}:`, err);
        return null;
    }
}

function loadAllUserProfiles() {
    const userStats = [];
    const files = fs.readdirSync(USER_DATA_DIR);
    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const userId = path.basename(file, '.json');
        const userPath = path.join(USER_DATA_DIR, file);
        const data = loadJsonFile(userPath);
        if (!data) continue;

        const birdInventory = data.bird || {};
        const totalBirdCount = Object.entries(birdInventory)
            .filter(([k]) => typeof birdData?.[k]?.value === 'number')
            .reduce((sum, [, v]) => sum + v, 0);

        let rarestBird = null;
        let maxValue = -Infinity;
        for (const [bird, qty] of Object.entries(birdInventory)) {
            const value = birdData?.[bird]?.value;
            if (qty > 0 && typeof value === 'number' && value > maxValue) {
                maxValue = value;
                rarestBird = bird;
            }
        }

        userStats.push({
            userId,
            totalBirdCount,
            rarestBird,
            fastestTime: data.fastestTime ?? null,
            slowestTime: data.slowestTime ?? null
        });
    }
    return userStats;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('view the leaderboards')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Leaderboard type')
                .setChoices(
                    { name: 'Total Birds', value: 'birds' },
                    { name: 'Fastest Time', value: 'fastest' },
                    { name: 'Slowest Time', value: 'slowest' }
                )
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('how many entries (max: 25)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('global')
                .setDescription('globle mode')
                .setRequired(false)),
    async execute(interaction) {
        const type = interaction.options.getString('type') ?? 'birds';
        let count = interaction.options.getInteger('count') ?? 10;
        let globalOption = interaction.options.getBoolean('global') ?? false;

        await interaction.deferReply();

        let stats = loadAllUserProfiles();
        let mentions = false
        
        if (!interaction.guild) {
            globalOption = true
        }

        if (count > 25) {
            count = 25
        }

        if (count < 0) {
            await interaction.editReply("https://cdn.discordapp.com/attachments/1129788329295097857/1287271697518694441/copy_11379239-44D0-48E4-BC7E-67BC13D84952.gif")
            return
        }

        if (!globalOption) {
            await interaction.guild.members.fetch();
            const memberIds = new Set(interaction.guild.members.cache.keys());
            stats = stats.filter(user => memberIds.has(user.userId));
            mentions = true
        }

        // Sorting logic
        if (type === 'fastest') {
            stats = stats.filter(u => typeof u.fastestTime === 'number');
            stats.sort((a, b) => a.fastestTime - b.fastestTime);
        } else if (type === 'slowest') {
            stats = stats.filter(u => typeof u.slowestTime === 'number');
            stats.sort((a, b) => b.slowestTime - a.slowestTime);
        } else {
            stats.sort((a, b) => b.totalBirdCount - a.totalBirdCount);
        }

        const top = stats.slice(0, count);
        const embed = {
            color: 0xfb5f44,
            title: globalOption
                ? `Global ${type[0].toUpperCase() + type.slice(1)} Leaderboard`
                : `Local ${type[0].toUpperCase() + type.slice(1)} Leaderboard`,
            fields: [],
        };
        let number = 0
        let isleaderboard = false
        embed.description = ""
        for (const userStat of top) {
            try {
                const user = await interaction.client.users.fetch(userStat.userId);
                let label, value;
                number = number + 1
                let displayname = "*unknown_user*"

                if (mentions) {
                    displayname = `<@${user.id}>`
                } else {
                    displayname = `${user.username}`
                }

                if (user.id === interaction.user.id) {
                    if (mentions) {displayname = `*<@${user.id}>*`} else {displayname = `__${user.username}__`}
                    isleaderboard = true
                }

                if (type === 'fastest') {
                    embed.description = embed.description + `${number}. **${userStat.fastestTime.toFixed(3)}**s: ${displayname}\n`
                } else if (type === 'slowest') {
                    embed.description = embed.description + `${number}. **${formatCatchTime(userStat.slowestTime.toFixed(3))}**: ${displayname}\n`
                } else {
                    const emoji = birdData?.[userStat.rarestBird]?.emoji ?? "🤣";
                    embed.description = embed.description + `${number}. **${userStat.totalBirdCount}** birds: ${emoji} ${displayname}\n`
                }

            } catch {
            }
        }

        if (embed.description === undefined) {
            embed.description = "No data available for leaderboard.";
        }

        if (!isleaderboard) {
            const userStat = stats.find(u => u.userId === interaction.user.id);
            if (mentions) {displayname = `*<@${interaction.user.id}>*`} else {displayname = `__${interaction.user.username}__`}
            if (type === 'fastest') {
                embed.description = embed.description + `\n**${userStat.fastestTime.toFixed(3)}**s: ${displayname}`
            } else if (type === 'slowest') {
                embed.description = embed.description + `\n**${formatCatchTime(userStat.slowestTime.toFixed(3))}**: ${displayname}`
            } else {
                const emoji = birdData?.[userStat.rarestBird]?.emoji ?? "🤣";
                embed.description = embed.description + `\n**${userStat.totalBirdCount}** birds: ${emoji} ${displayname}`
            }
        }

        await interaction.editReply({ embeds: [embed] });
    },
    userApp: true,
};

function formatCatchTime(totalSeconds) {
  const isNegative = totalSeconds < 0;
  totalSeconds = Math.abs(totalSeconds);

  const time = {
    day: Math.floor(totalSeconds / (24 * 60 * 60)),
    hour: 0,
    minute: 0,
    second: 0
  };

  let remaining = totalSeconds % (24 * 60 * 60);
  time.hour = Math.floor(remaining / (60 * 60));
  remaining %= 60 * 60;
  time.minute = Math.floor(remaining / 60);
  remaining %= 60;

  // Round seconds to the nearest 0.001
  time.second = Math.round((remaining + Number.EPSILON) * 1000) / 1000;

  const parts = Object.entries(time)
    .filter(([_, val]) => val > 0)
    .map(([unit, val]) => `${val} ${unit}${val !== 1 ? 's' : ''}`);

  return (isNegative ? '-' : '') + (`${time.day} days ${time.hour}:${time.minute}:${time.second}`)
}

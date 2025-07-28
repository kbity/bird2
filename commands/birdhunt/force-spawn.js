const {
    SlashCommandBuilder
} = require('discord.js');
const {
    minSpawnTime,
    maxSpawnTime
} = require('../../config.json');
const {
    loadChannels,
    saveChannels,
    loadJsonFile
} = require('../../birdfslib');
const { evalWhitelist } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forcespawn')
        .setDescription('(OWNER ONLY) forces a spawn')
        .addStringOption(option =>
            option.setName('bird')
            .setDescription('The type of bird to spawn')
            .setRequired(true)),
    async execute(interaction) {
        const channels = await loadChannels(interaction.guild.id);
        const channelId = interaction.channel.id;
        if (!evalWhitelist.includes(interaction.user.id)) {
            await interaction.reply("disable qweyu mode");
            return
        }
        if (channels.get(channelId) == undefined) {
            const spawnTime = Date.now() + 10 * 60 * 1000;
            channels.set(interaction.channel.id, {
                birdPresent: false,
                spawnTimestamp: spawnTime,
                lastCaught: Date.now()
            });
            await saveChannels(interaction.guild.id, channels);
        }
        const birdis = channels.get(channelId).birdPresent

        if (birdis == true) {
            await interaction.reply({
                content: "there's a bird rn",
                ephemeral: true
            });
        };
        const birdData = await loadJsonFile('./data.json');

        const birdType = interaction.options.getString('bird').toLowerCase();

        if (!birdData[birdType]) {
            await interaction.reply({
                content: `apparently there's no **${birdType}s**.`,
                ephemeral: true
            });
            return;
        }

        const now = Date.now();
        const channelData = channels.get(channelId);

        const birdfullpart = {
            name: birdType,
            emoji: birdData[birdType].emoji
        }

        // Update channel state safely.
        const updated = {
            ...channelData,
            birdPresent: true,
            spawnTimestamp: now,
            currentBird: birdfullpart
        };

        channels.set(channelId, updated);

        const emojiMatch = birdData[birdType].emoji.match(/\d+/);
        if (emojiMatch) {
            birdicon = {
                url: `https://cdn.discordapp.com/emojis/${emojiMatch[0]}.png?size=1024`
            };
        } else {
            birdicon = undefined;
        }

        let embed = {
            title: `${birdData[birdType].emoji} ${birdType} has appeared!`,
            description: 'Type "bird" to catch it!',
            image: birdicon,
            color: 0xfb5f44
        };


        try {
            await interaction.channel.send({
                embeds: [embed]
            });
            await interaction.reply({
                content: `**${birdType}** spawned.`,
                ephemeral: true
            });
        } catch (err) {
            console.error(`[SPAWN] Failed to send bird embed to ${channelId}: trying again..., ${err}`);
            try {
                await interaction.channel.send({
                    embeds: [embed]
                });
            } catch (err) {
                console.error(`[SPAWN] Failed to send bird embed to ${channelId} again: bailing out, ${err}`);
            }
        }

        await saveChannels(interaction.guild.id, channels);

    },
};

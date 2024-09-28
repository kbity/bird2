process.on('uncaughtException', function (exception) {
  console.log(exception)
});

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('progressbird95')
        .setDescription('Progressbar95 in discord, kind of'),
    async execute(interaction) {
        // Initialize game state for each command execution
        let bar = new Array(10).fill(config.emojis.pbgray);
        let segmentList = [];
        const maxSegments = 5;
        const commandUserId = interaction.user.id; // Store the ID of the user who initiated the command

const manageSegmentList = async () => {
    if (segmentList.length >= maxSegments) {
        segmentList.shift(); // Remove the oldest segment if list is full
    }

    // Define the weighted segments based on the desired spawn rates
    const weightedSegments = [
        ...Array(25).fill(config.emojis.blue),       // Blue - 25%
        ...Array(18).fill(config.emojis.orange),     // Orange - 18%
        ...Array(13).fill(config.emojis.red),        // Red - 13%
        ...Array(13).fill(config.emojis.rand),          // Random - 13%
        ...Array(12).fill(config.emojis.pink),     // Pink - 12%
        ...Array(12).fill(config.emojis.pbgray),// Grey - 12%
        ...Array(10).fill(config.emojis.lblu),       // Light Blue - 10%
        ...Array(1).fill(config.emojis.gree)        // Green - 1%
    ];

    // Select a new segment based on the weighted probabilities
    const newSegment = weightedSegments[Math.floor(Math.random() * weightedSegments.length)];
    segmentList.push(newSegment);

    // Update the game message with the new segment list
    const updatedGameEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Progressbird95')
        .setDescription(createGameMessage('continue')); // Game continues
    
    await interaction.editReply({ embeds: [updatedGameEmbed] });
};


        // Function to update the game bar with user-selected segment
        function updateBar(segment) {
            if (segment === config.emojis.red) {
                bar.fill(config.emojis.red); // Fill the bar with red segments
                return 'dataLost'; // Special case for red segment
            }
    if (segment === config.emojis.pink) { // Pink segment removes two last segments
        let removed = 0;
        for (let i = bar.length - 1; i >= 0 && removed < 1; i--) {
            if (bar[i] !== config.emojis.pbgray) {
                bar[i] = config.emojis.pbgray;
                removed++;
            }
        }
        return 'continue';
    }
    if (segment === config.emojis.lblu) { // Light blue segment adds 2 blue segments
        let added = 0;
        for (let i = 0; i < bar.length && added < 2; i++) {
            if (bar[i] === config.emojis.pbgray) {
                bar[i] = config.emojis.blue;
                added++;
            }
        }
        // Check if the bar is full after adding the blue segments
        const filledSegments = bar.filter(seg => seg !== config.emojis.pbgray).length;
        return filledSegments === bar.length ? 'gameOver' : 'continue';
    }
            if (segment === config.emojis.gree) { // Green segment fills the bar with blue and gives 100% normal
                bar.fill(config.emojis.blue);
                return 'gameOver';
            }
            if (segment === config.emojis.rand) { // Random segment does a random thing
                const randomAction = Math.floor(Math.random() * 4);
                if (randomAction === 0) {
                    return updateBar(config.emojis.orange); // Add a corrupt segment
                } else if (randomAction === 1) {
                    return updateBar(config.emojis.blue); // Add a normal segment
                } else if (randomAction === 2) {
                    return updateBar(config.emojis.red); // End the game with data loss
                } else {
                    return updateBar(config.emojis.pink); // Remove the last segment
                }
            }
            if (bar.includes(config.emojis.pbgray)) {
                bar[bar.indexOf(config.emojis.pbgray)] = segment;
            }
            const filledSegments = bar.filter(segment => segment !== config.emojis.pbgray).length;
            return filledSegments === bar.length ? 'gameOver' : 'continue'; // Return game state
        }

        // Function to create the game message
        function createGameMessage(gameState) {
            const gameBar = `[${bar.join('')}]`;
            let gameMessage;

            if (gameState === 'gameOver') {
                const normalSegments = bar.filter(segment => segment === config.emojis.blue).length;
                const corruptSegments = bar.filter(segment => segment === config.emojis.orange).length;
                const normalPercentage = Math.round((normalSegments / bar.length) * 100);
                const corruptPercentage = Math.round((corruptSegments / bar.length) * 100);
                gameMessage = `Game Over!\n${gameBar}\nNormal: **${normalPercentage}%**\nCorrupt: **${corruptPercentage}%**`;
		const userId = interaction.user.id;
		const achievementGranted = achHandler.grantAchievement(userId, 3, interaction);
            }
            else if (gameState === 'dataLost') {
                gameMessage = `Data Lost!\n${gameBar} ERR%\n`;
            } else {
                const filledSegments = bar.filter(segment => segment !== config.emojis.pbgray).length;
                const fillPercentage = Math.round((filledSegments / bar.length) * 100);
                const segmentOptions = segmentList.map((emoji, index) => `${index + 1}) ${emoji}`).join('\n');
                gameMessage = `-- Type Segment Number to Catch --\n${gameBar} ${fillPercentage}%\n${segmentOptions}`;
            }

            return gameMessage;
        }

        // Send the initial game state
        const gameEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Progressbird95')
            .setDescription(createGameMessage('continue', bar)); // Game is not over yet
        
        const initialMessage = await interaction.reply({ embeds: [gameEmbed], fetchReply: true });

        // Set an interval to manage segments and update the game message
        const segmentInterval = setInterval(manageSegmentList, 5000);

        // Listen for user input
        const filter = m => m.author.id === commandUserId && !isNaN(m.content) && m.content >= 1 && m.content <= segmentList.length;
        const collector = interaction.channel.createMessageCollector({ filter });

        collector.on('collect', async m => {
            const segmentIndex = parseInt(m.content, 10) - 1;
            if (segmentList[segmentIndex]) {
                // Add the segment to the bar and check the game state
                const gameState = updateBar(segmentList[segmentIndex]);
                segmentList.splice(segmentIndex, 1); // Remove the used segment from the list
                m.delete(); // Delete the user's message

                if (gameState === 'gameOver' || gameState === 'dataLost') {
                    // End the game if the bar is full or data is lost
                    clearInterval(segmentInterval);
                    collector.stop();
                    await initialMessage.edit({ embeds: [new EmbedBuilder().setColor(0x0099FF).setTitle('Progressbird95').setDescription(createGameMessage(gameState, bar))] });
                } else {
                    // Update the game message with the new bar state and available segments
                    const updatedGameEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('Progressbird95')
                        .setDescription(createGameMessage('continue', bar)); // Game continues
                    
                    await interaction.editReply({ embeds: [updatedGameEmbed] });
                }
            }
        });

        collector.on('end', () => {
            clearInterval(segmentInterval);
        });
    },
};
const { SlashCommandBuilder } = require('discord.js');
//const { Api } = require('@top-gg/sdk'); --uncomment to enable, requires top.gg sdk and top.gg token--
const { emojis, tggtoken } = require('../../config.json');
const { loadInventories, saveInventories, birdsFilePath } = require('../../birdfslib.js');
const birdData = require('../../data.json');

// Create Top.gg API client
//const api = new Api(tggtoken); --uncomment to enable, requires top.gg sdk and top.gg token--

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vote and Claim your reward after voting on top.gg'),
  async execute(interaction) {
    if (tggtoken === "None") {
        await interaction.reply(`Voting Disabled.\n[Vote here if you'd like'](https://top.gg/bot/1118256931040149626/vote>)`);
    }
    await interaction.deferReply()
    const userId = interaction.user.id;
    const inventories = await loadInventories(userId);

    if (!inventories.has("bird")) {
      inventories.set("bird", {});
      await saveInventories(userId, inventories);
    }

    if (!inventories.has("lastclaim")) {
      inventories.set("lastclaim", 0);
      await saveInventories(userId, inventories);
    }

    const userInventory = inventories.get("bird");

    if (Date.now() - inventories.get("lastclaim") < 12 * 60 * 60 * 1000) {
        await interaction.followUp(`${emojis.fail} You have already claimed your birds! you can vote and claim again at <t:${Math.round(((inventories.get("lastclaim") / 1000) + 12 * 60 * 60))}:f>`);
        return
    }

    // Use Object.entries() to work with the object
    let totalValue = Object.entries(userInventory).reduce((total, [bird, count]) => {
      const birdInfo = birdData[bird];
      if (birdInfo) {
        total += birdInfo.value * count;
      }
      return total;
    }, 0);

    try {
      const hasVoted = await api.hasVoted(userId);

      if (hasVoted) {
        // Set random value range between 50-650
        const randomValue = Math.floor(Math.random() * (650 - 50 + 1)) + 50;

        let addedBirds = {};
        let remainingValue = randomValue;
        let typesAdded = 0;

        while (remainingValue > 0 && typesAdded < 5) {
          // Pick a random bird from bird data
          const amount = Math.floor(Math.random() * 5) + 1;  // Add 1-5 birds
          const birds = Object.entries(birdData).filter(([birdName, birdInfo]) =>
              birdInfo.type === "bird" && birdInfo.value * amount <= remainingValue
          );

          if (birds.length === 0) break;  // No birds can be added if none fit the value range

          const [birdName, birdInfo] = birds[Math.floor(Math.random() * birds.length)];

          // Determine how many of this bird to add
          remainingValue -= birdInfo.value * amount;

          // Add the bird to the addedBirds object
          addedBirds[birdName] = (addedBirds[birdName] || 0) + amount;
          typesAdded += 1;
        }

        // Add the selected birds to the user's inventory
        for (const [bird, amount] of Object.entries(addedBirds)) {
          userInventory[bird] = (userInventory[bird] || 0) + amount;
        }
        inventories.set("lastclaim", Date.now());

        await saveInventories(userId, inventories);

        // Respond with the random birds added
        let birdsList = Object.entries(addedBirds)
          .map(([bird, amount]) => `* **${amount}** ${birdData[bird].emoji} ${bird}s`)
          .join('\n');

        await interaction.followUp(`${emojis.catch} Thank you for voting! You’ve rolled a value of ${randomValue} and have received:\n${birdsList}`);
      } else {
        await interaction.followUp(`[Vote here for free birds](https://top.gg/bot/1118256931040149626/vote>)`);
      }
    } catch (error) {
      console.error('Error checking Top.gg vote:', error);
      try {
        await interaction.followUp('⚠️ There was an error checking your vote. Please try again later. This is expected if you don\'t have a Top.gg account.\n[Vote here for free birds](https://top.gg/bot/1118256931040149626/vote>)');
      } catch (error) {
        await interaction.channel.send('⚠️ There was an error checking your vote. Please try again later. This is expected if you don\'t have a Top.gg account.\n[Vote here for free birds](https://top.gg/bot/1118256931040149626/vote>)');
      }
    }
  },
  userApp: true, // Flag to enable adding user app mode
};


const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { fileExists } = require('../../birdfslib.js');
const { emojis } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('Displays achievements for you or another user')
    .addStringOption(option =>
      option.setName('catagory')
        .setDescription('the catagory of achivement to view')
        .setRequired(true)
        .addChoices(
            { name: 'Miscellaneous', value: 'miscellaneous' },
            { name: 'Bird Hunt', value: 'bird hunt' },
            { name: 'Command', value: 'command' },
            { name: 'Game', value: 'game' },
            { name: 'Unfair', value: 'unfair' }
        )
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view achievements for')
        .setRequired(false)
    ),
  async execute(interaction) {
    const catagory = interaction.options.getString('catagory');
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

    // Read achievements and user achievements from JSON files
    const achievements = JSON.parse(fs.readFileSync(`achs.json`));

    await fileExists(`per_user/${userId}.json`)

    const userAchievements = JSON.parse(fs.readFileSync(`per_user/${userId}.json`)).achs || [];

    const isSelf = targetUser.id === interaction.user.id; // Check if the target user is the command invoker

    if (userAchievements.length === 0) {
      return interaction.reply(
        isSelf 
          ? 'You have none lmao'
          : `${targetUser.username} has none lmao`
      );
    }

    const totalAchievements = achievements.length;
    const obtainedCount = userAchievements.length;

    const achievementsInCategory = achievements.filter(a => a.catagory === catagory);

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Achievements in ${catagory} (${obtainedCount}/${totalAchievements})`)
      .setColor(0xfb5f44);

    achievementsInCategory.forEach(ach => {
      const obtained = userAchievements.includes(ach.id);
     embed.addFields({
        name: `${obtained ? ach.icon2 : emojis.unknown_ach} ${ach.name}`,  // Mark obtained or not
        value: obtained ? ach.description : "[Locked]",
        inline: true,
      });
    });
    await interaction.reply({ embeds: [embed] });
  },
};

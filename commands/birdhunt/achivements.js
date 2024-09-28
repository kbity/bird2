const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('Displays your obtained achievements'),
  async execute(interaction) {
    const userId = interaction.user.id;

    // Read achievements and user achievements from JSON files
    const achievements = JSON.parse(fs.readFileSync('achs.json'));
    const userAchievements = JSON.parse(fs.readFileSync('achdb.json')).users[userId] || [];

    if (userAchievements.length === 0) {
      return interaction.reply('You have not obtained any achievements yet.');
    }

    const totalAchievements = achievements.length;
    const obtainedCount = userAchievements.length;

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Achievements (${obtainedCount}/${totalAchievements})`)
      .setColor('#FFD700');

    userAchievements.forEach(achId => {
      const ach = achievements.find(a => a.id === achId);
      if (ach) {
        embed.addFields({ name: `${ach.icon2} ${ach.name}`, value: ach.description, inline: true });
      }
    });

    await interaction.reply({ embeds: [embed] });
  },
};

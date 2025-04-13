const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('Displays achievements for you or another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view achievements for')
        .setRequired(false)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

    // Read achievements and user achievements from JSON files
    const achievements = JSON.parse(fs.readFileSync('achs.json'));
    const userAchievements = JSON.parse(fs.readFileSync('achdb.json')).users[userId] || [];

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

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Achievements (${obtainedCount}/${totalAchievements})`)
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

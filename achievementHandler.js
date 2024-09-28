const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

class AchievementHandler {
  constructor() {
    this.achievements = JSON.parse(fs.readFileSync('achs.json'));
    this.userAchievements = JSON.parse(fs.readFileSync('achdb.json'));
  }

  grantAchievement(userId, achievementId, context, username = null, overrideUsername = null) {
    // Reload the user achievements from the file
    this.userAchievements = JSON.parse(fs.readFileSync('achdb.json'));

    if (!this.userAchievements.users[userId]) {
      this.userAchievements.users[userId] = [];
    }

    if (!this.userAchievements.users[userId].includes(achievementId)) {
      this.userAchievements.users[userId].push(achievementId);
      this.saveUserAchievements();

      const achievement = this.getAchievementDetails(achievementId);
      if (achievement) {
        const embed = new EmbedBuilder()
          .setTitle(achievement.name)
          .setDescription(achievement.description)
          .setColor('#FFD700')
          .setAuthor({
            name: 'Achievement acquired!',
            iconURL: achievement.icon1,
          })
          .setFooter({ text: `Unlocked by ${overrideUsername || username || (context.author ? context.author.username : context.user.username)}` })
          .setTimestamp();

        if (context.channel) {
          if (!context.replied && !context.deferred) {
            context.reply({ embeds: [embed] });
          } else {
            context.followUp({ embeds: [embed] });
          }
        } else if (context.reply) {
          if (!context.replied && !context.deferred) {
            context.reply({ embeds: [embed] });
          } else {
            context.followUp({ embeds: [embed] });
          }
        } else {
          // Check if the bot is in a server
          if (context.guild) {
            context.channel.send({ embeds: [embed] });
          } else {
            // Send a DM to the user
            context.user.send({ embeds: [embed] });
          }
        }
      }

      return true; // Achievement granted
    }

    return false; // Achievement already obtained
  }

  getUserAchievements(userId) {
    return this.userAchievements.users[userId] || [];
  }

  saveUserAchievements() {
    fs.writeFileSync('achdb.json', JSON.stringify(this.userAchievements, null, 2));
  }

  getAchievementDetails(achievementId) {
    return this.achievements.find(ach => ach.id === achievementId);
  }
}

module.exports = AchievementHandler;

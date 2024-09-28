const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

class AchievementHandler {
  constructor() {
    this.achievements = JSON.parse(fs.readFileSync('achs.json'));
    this.userAchievements = JSON.parse(fs.readFileSync('achdb.json'));
  }

  async grantAchievement(userId, achievementId, context, username = null, overrideUsername = null) {
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

        await this.followUpWithRetry(context, embed);
      }

      return true; // Achievement granted
    }

    return false; // Achievement already obtained
  }

  async followUpWithRetry(context, embed, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (context.channel) {
          await context.followUp({ embeds: [embed] });
        } else if (context.reply) {
          await context.followUp({ embeds: [embed] });
        } else {
          // Check if the bot is in a server
          if (context.guild) {
            await context.channel.send({ embeds: [embed] });
          } else {
            // Send a DM to the user
            await context.user.send({ embeds: [embed] });
          }
        }
        break; // Exit loop if successful
      } catch (error) {
        if (error.name === 'InteractionNotReplied') {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 second before retrying
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    }
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
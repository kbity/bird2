const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const { fileExists } = require('./birdfslib.js');
let userAchievements = undefined
let achsFilePath = undefined

class AchievementHandler {
  constructor() {
    this.achievements = JSON.parse(fs.readFileSync('achs.json'));
  }

  grantAchievement(userId, achievementId, context, username = null, overrideUsername = null) {
    achsFilePath = `./per_user/${userId}.json`
    fileExists(achsFilePath)
    userAchievements = JSON.parse(fs.readFileSync(`./per_user/${userId}.json`));

    if (!userAchievements.achs) {
      userAchievements.achs = [];
    }

    if (!userAchievements.achs.includes(achievementId)) {
      userAchievements.achs.push(achievementId);
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
    return userAchievements.achs || [];
  }

  saveUserAchievements() {
    fs.writeFileSync(achsFilePath, JSON.stringify(userAchievements, null, 2));
  }

  getAchievementDetails(achievementId) {
    return this.achievements.find(ach => ach.id === achievementId);
  }
}

module.exports = AchievementHandler;

const { Events } = require('discord.js');
const { emojis } = require('../config.json');
const AchievementHandler = require('../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute(message) {
        if (message.webhookId) return;

        if (message.content.toLowerCase() === 'mari!sex') {
            message.channel.send("👁️ **attention!** 👁️\n👺 {you have} **insulted the president of chicken coop** 👺\n🚶‍♀️ {please} **leave the premises at once** 🚶‍♂️\n💩👹👾 {or face the might of our nuclear arsenal} 💩👹👾");
        }

        if (message.content.toLowerCase().includes('quine')) {
            message.react(emojis.professor);
        }
    
        if (message.content.toLowerCase() === 'bird!i_visited_website') {
            const userId = message.author.id;
            const achievementGranted = achHandler.grantAchievement(userId, 4, message);
        }
    
        if (message.content.toLowerCase() === 'bird!mari_is_cute') {
            const userId = message.author.id;
            const achievementGranted = achHandler.grantAchievement(userId, 5, message);
        }
    
        if (message.content.toLowerCase().includes('<@1225905087352672298>')) {
            const userId = message.author.id;
            const achievementGranted = achHandler.grantAchievement(userId, 6, message);
        }

        if (message.content.toLowerCase().includes('hedron')) {
            const userId = message.author.id;
            const achievementGranted = achHandler.grantAchievement(userId, 18, message);
        }
    }
};

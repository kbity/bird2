const { Events } = require('discord.js');
const { prefix } = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (command !== 'garden') return;

        // Expect format: !garden @user reason...
        const userMention = args.shift();
        const reason = args.join(' ');

        if (!userMention || !reason) {
            return message.reply('Usage: `!garden @user <reason>`');
        }

        const userIdMatch = userMention.match(/^<@!?(\d+)>$/);
        if (!userIdMatch) {
            return message.reply('Please mention a valid user.');
        }

        const userId = userIdMatch[1];
        const user = await message.client.users.fetch(userId).catch(() => null);
        if (!user) {
            return message.reply('Could not find the specified user.');
        }

        const percentage = Math.floor(Math.random() * 101);

        const response = `${user} was gardened by ${message.author} for \`${reason}\`!`;
        await message.reply(response);

        achHandler.grantAchievement(user.id, 15, message, user.username);
    },
};

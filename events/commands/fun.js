const { Events } = require('discord.js');
const { prefix } = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'bird') {
            // Load bird emojis from birds.json
            const birds = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../birds.json'), 'utf8'));
            const birdEmojis = birds.map(bird => bird.emoji);

            const randomIndex = Math.floor(Math.random() * 100);
            let selectedEmoji;

            if (randomIndex < 50) {
                selectedEmoji = '<:bird:1214018194423947264>';
            } else {
                const otherBirdIndex = Math.floor(Math.random() * birdEmojis.length);
                selectedEmoji = birdEmojis[otherBirdIndex];
            }

            await message.reply(selectedEmoji);
        }

        if (command === 'cabbage') {
            await message.reply('https://cdn.discordapp.com/attachments/806268326031917067/1218060235135254588/cabbagepultchickent2.png');
        }

        if (command === 'catgirl') {
            fetch('https://nekos.best/api/v2/neko')
                .then(response => response.json())
                .then(json => {
                    const imageUrl = json.results[0].url;
                    message.reply(imageUrl);
                    const userId = message.author.id;
                    setTimeout(() => {
                        achHandler.grantAchievement(userId, 9, message);
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error fetching neko image:', error);
                    message.reply('Could not fetch neko image.');
                });
        }
    }
};


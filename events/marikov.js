const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const AchievementHandler = require('../achievementHandler');
const achHandler = new AchievementHandler();
const marikov = require('../marikov');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        // Reload marikovdb.json every time a message is received
        let marikovdb;
        try {
            marikovdb = JSON.parse(fs.readFileSync(path.join(__dirname, '../marikovdb.json')));
        } catch (error) {
            console.error('Error reading marikovdb.json:', error);
            marikovdb = {
                channels: [],
                optedOutUsers: []
            }; // Fallback in case of error
        }

        // Automatically respond if the message is in a channel listed in marikovdb.json
        const isAutoRespondChannel = marikovdb.channels.includes(message.channel.id);

        // Check if the bot is mentioned or if it's in an auto-respond channel
        if (message.mentions.has(message.client.user) || isAutoRespondChannel) {
            // Filter out all mentions from the message
            const cleanMessage = message.content
                .replace(/<@!?[0-9]+>/g, '')
                .replace(/@everyone|@here/g, '')
                .trim();

            // If there's no extra content and it's a mention, respond with a default message
            if (cleanMessage.length === 0 && message.mentions.has(message.client.user)) {
                await message.channel.send("uhh hello i guess");
                return;
            }

            try {
                // Use the marikov generator to generate a response based on the user's input
                let response = await marikov.generateMarkovResponse(cleanMessage);
                response = response.replace(/<@!?[0-9]+>/g, ''); // Strip mentions from output
                await message.channel.send(response);

                // Log the cleaned message along with user ID and mention to corpus.txt if user is not opted out
                if (!marikovdb.optedOutUsers.includes(message.author.id) && cleanMessage.length > 0) {
                    const logEntry = `${cleanMessage} <@${message.author.id}>\n`;
                    fs.appendFile('corpus.txt', logEntry, (err) => {
                        if (err) {
                            console.error('Error writing to corpus.txt:', err);
                        }
                    });
                }
            } catch (error) {
                console.error('Error generating response:', error);
                await message.channel.send('wuh??');
            }
        }
    }
};


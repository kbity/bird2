const { Events, client } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        if (!message.content.startsWith(prefix)) return;
        if (command !== 'ping') return;
        let time = Date.now()
        let cite = await message.reply(`\`Checking...\``);
        await cite.reply(`bird is operating at a latency of ${cite.createdTimestamp - time}ms.`);
    },
};

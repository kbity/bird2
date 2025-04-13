const { Events, Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { startupMessageChannel, startupMessages } = require('../config.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        const channel = client.channels.cache.get(startupMessageChannel);
        
        const startupMessageId = Math.floor(Math.random() * startupMessages.length);
        const startupMessage = startupMessages[startupMessageId];

        if (channel) { channel.send(startupMessage); } else { console.log('Error sending init message! ensure bot has required permissions'); }

        // Initialize presence
        client.user.setPresence({ activities: [{ name: 'Initializing...' }], status: 'dnd' });

        let presenceInterval = setInterval(() => {
            client.user.setPresence({
                activities: [{ 
                    name: 'bird v2.4.2', 
                    type: ActivityType.Custom 
                }],
                status: 'online'
            });
        }, 1000);
    },
};

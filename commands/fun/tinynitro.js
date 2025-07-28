const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tinynitro')
        .setDescription('Creates a Fake Nitro Gift that is Really Small')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send when the button is clicked')
                .setRequired(false)),
    async execute(interaction) {
        const senderUsername = interaction.user.username;
        const description = `**${senderUsername}** has gifted you Nitro for **0 months**!`;
        const spaces = '  '.repeat(description.length);

        const messageContent = interaction.options.getString('message');
        const messageToSend = messageContent ? messageContent : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Default to a Rickroll if the message is blank

        const fakeGiftEmbed = new EmbedBuilder()
            .setColor(0x1E1F22)
            .setTitle("You've been gifted a subscription!")
            .setDescription(description)
            .setThumbnail('https://cdn.discordapp.com/attachments/782434583974248511/793316025244057630/nitroregular.png?ex=65937f9f&is=65810a9f&hm=0d2a4c0c8ee17f1d0c1220f26b77d786354f98b0a256d0c6c8f6692f3d1e6612&')
			.setFooter({ text: `‎${spaces}Expires in 0 hours`});

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('sendDMButton')
                    .setLabel('Accept')
                    .setStyle('3') // Set the style to Sucess (Green)
            );

        // Send the embed with the button as a message to the channel
        const sentMessage = await interaction.channel.send({ embeds: [fakeGiftEmbed], components: [row] });

        // Reply to the command interaction with an ephemeral message
        await interaction.reply({
            content: 'HEADS UP: This is a Fake Gift. Gifts like these are Fake and are Using Embeds. a Real Gift is longer than what you can make with embeds (or a decent bit tall if your monitor is too short but tall enough). They will never look like this or like a typical Embed you get from a YouTube Video, a website or the like.',
            ephemeral: true
        });

        // Create a collector for button interactions
        const filter = i => i.customId === 'sendDMButton' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 }); // Adjust the time as needed

        collector.on('collect', async (buttonInteraction) => {
            // DM the user who clicked the button with the provided message or default link
            try {
                await buttonInteraction.deferUpdate();
                await buttonInteraction.user.send(messageToSend);

                // Disable the button after it's used
                row.components[0].setDisabled(true);
                sentMessage.edit({ components: [row] }); // Disable the button in the sent message
            } catch (error) {
                console.error('Failed to send DM:', error);
            }
        });
    },
};


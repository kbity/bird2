const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar link of a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 });
        let avatarURLpng = avatarURL.replace("webp", "png");
        await interaction.reply(`Avatar of ${user.username}: ${avatarURLpng}`);
    },
    userApp: true, // Flag to enable adding user app mode
};


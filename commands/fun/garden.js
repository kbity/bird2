const { SlashCommandBuilder } = require('discord.js');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('garden')
        .setDescription('i breethe grass')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Enter a reason')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        // Generate a random number between 0 and 100
        const percentage = Math.floor(Math.random() * 101);

        const response = `${user} was gardened by ${interaction.user} for \`${reason}\`!`;
        await interaction.reply(response);
        const achievementGranted2 = achHandler.grantAchievement(user.id, 15, interaction, user.username);
    },
    userApp: true, // Flag to enable adding user app mode
};


const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();
const itemdata = require('../../data.json');

const itemsSold = Object.entries(itemdata)
    .filter(([key, entry]) => entry.type === "item" && entry.sold)
    .map(([key, entry]) => ({ name: key, ...entry }));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('buy things from the store i think'),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("bird store or whatever")
            .setDescription(
                itemsSold
                    .map(item => `${item.emoji} **${item.name}**\n\`${item.value} bird moneys\``)
                    .join('\n')
            )
            .setColor(0xFB5F44);

        await interaction.reply({ embeds: [embed] });

        achHandler.grantAchievement(interaction.user.id, 40, interaction);
    },
    userApp: true,
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('percent')
        .setDescription('The amount of something someone is')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('property')
                .setDescription('Enter a property')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const property = interaction.options.getString('property');

        // Generate a random number between 0 and 100
        const percentage = Math.floor(Math.random() * 101);

        const response = `${user} is ${percentage}% ${property}, imo`;
        await interaction.reply(response);
    },
};


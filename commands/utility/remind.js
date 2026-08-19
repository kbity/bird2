const { SlashCommandBuilder } = require('discord.js');
const { loadInventories, saveInventories } = require('../../birdfslib.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('reminds you of events i fukign guess')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('why')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('The number of seconds')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('The number of minutes')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('hours')
                .setDescription('The number of hours')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('The number of days')
                .setRequired(false)),
	async execute(interaction) {
        try {await interaction.deferReply()} catch {return}
        const seconds = interaction.options.getInteger('seconds') || 0;
        const minutes = interaction.options.getInteger('minutes') || 0;
        const hours = interaction.options.getInteger('hours') || 0;
        const days = interaction.options.getInteger('days') || 0;
        const reason = interaction.options.getString('reason');
        const time = seconds + minutes*60 + hours*60*60 + days*60*60*24
        const inventories = await loadInventories(interaction.user.id);
		await interaction.followUp(`will remind you about ${reason} <t:${Math.round((Date.now()/1000)) + time}:R>`);
        if (!inventories.has("reminders")) {
          inventories.set("reminders", {});
          await saveInventories(interaction.user.id, inventories);
        }
        const userreminders = inventories.get("reminders");
        userreminders[interaction.id] = {
            reason: reason,
            time: Date.now() + (time * 1000)
        };
        await saveInventories(interaction.user.id, inventories);
	},
    userApp: true, // Flag to enable adding user app mode
};


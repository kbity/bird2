const { SlashCommandBuilder } = require('discord.js');
const { feedback_webhook } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submits feedback to the developer')
        .addStringOption(option => 
            option.setName('feedback')
                .setDescription('put feedback here')
                .setRequired(true)),
    
    async execute(interaction) {
        const feedback = interaction.options.getString('feedback');

        if (feedback_webhook === "None") {
            return interaction.reply("not configured");
        }

        await interaction.deferReply();

        const payload = {
            content: `<@${interaction.user.id}> submitted:\n${feedback}`,
            "allowed_mentions": {"parse": []}
        };

        try {
            const res = await fetch(feedback_webhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.error("Failed:", res.status, res.statusText);
                await interaction.followUp("error submitting feedback");
                return;
            }
            await interaction.followUp("feedback submitted");

        } catch (error) {
            console.error(error);
            await interaction.followUp("failed to submit feedback (exception)");
        }
    },

    userApp: true, // Flag to enable adding user app mode
};


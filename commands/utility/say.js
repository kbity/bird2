const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Hello I am a Bird')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('What to say')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('replyid')
				.setDescription('Message ID to reply to')
				.setRequired(false))
		.addBooleanOption(option =>
			option.setName('replyping')
				.setDescription('Whether to ping the user being replied to')
				.setRequired(false))
		.addAttachmentOption(option =>
			option.setName('attachment')
				.setDescription('Upload a file to attach')
				.setRequired(false)),

	async execute(interaction) {
		const message = interaction.options.getString('message');
		const replyId = interaction.options.getString('replyid');
		const replyPing = interaction.options.getBoolean('replyping') ?? false;
        const attachment = interaction.options.getAttachment('attachment');
		const member = interaction.member;

		const user = interaction.user;
        if (message.startsWith("bird!gift")){
            await interaction.reply("Don't you know that Property is Theft? Now you're under arrest, 'cause I got nothing left.")
		    const userId = interaction.user.id;
		    const achievementGranted = achHandler.grantAchievement(userId, 26, interaction);
            return}

		// If in DMs, just send the message
		if (!interaction.guild) {
			await interaction.reply({ content: 'Message sent.', ephemeral: true });
			await interaction.user.send(message);
			return;
		}

		// Check whitelist
        if (!(config.sayWhitelist.includes(user.id) || member.permissions.has(PermissionsBitField.Flags.Administrator)))
            {
		    	await interaction.reply({ content: 'not allowed', ephemeral: true });
		    	return;
		    }

		await interaction.deferReply({ ephemeral: true });

		let sendPayload = { content: message };

		if (attachment) {
			sendPayload.files = [attachment];
		}

		// Try to reply to a specific message if given
		if (replyId) {
			try {
				const targetMsg = await interaction.channel.messages.fetch(replyId);
				sendPayload = {
					...sendPayload,
					reply: {
						messageReference: targetMsg.id,
						failIfNotExists: false,
					},
					allowedMentions: {
						repliedUser: replyPing,
					},
				};
			} catch (err) {
				console.warn(`Failed to fetch reply message ${replyId}:`, err);
			}
		}

		await interaction.channel.send(sendPayload);
		await interaction.editReply({ content: 'Message sent successfully.' });
	},
};


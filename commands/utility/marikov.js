const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const marikov = require('../../marikov'); // Assuming you have a Markov generator implemented here
const path = './marikovdb.json'; // Path to the JSON file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('marikov')
		.setDescription("Generates Mari's modified Markov, and manages channels and opted-out users.")
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-channel')
				.setDescription('Enables automatic marikov in a channel')
				.addChannelOption(option => option.setName('channel').setDescription('Channel to add').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove-channel')
				.setDescription('Disables automatic marikov in a channel')
				.addChannelOption(option => option.setName('channel').setDescription('Channel to remove').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('opt-out')
				.setDescription('Opts yourself out from logging input messages to "train" the bot'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('opt-in')
				.setDescription('Opts yourself back in to logging input messages to "train" the bot'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('response')
				.setDescription("Generates a response using Mari's modified Markov engine")
				.addStringOption(option => option.setName('message').setDescription('Your message to generate a response from').setRequired(true))),
	async execute(interaction) {
		// Load the JSON file
		let marikovdb;
		try {
			marikovdb = JSON.parse(fs.readFileSync(path, 'utf8'));
		} catch (error) {
			console.error('Error reading marikovdb.json:', error);
			marikovdb = { channels: [], optedOutUsers: [] };  // Fallback in case of error
		}

		// Determine which subcommand was executed
		const subcommand = interaction.options.getSubcommand();
		const userId = interaction.user.id; // Always the ID of the user invoking the command
		const isGuild = !!interaction.guild; // Check if command is in a guild (server) or a user command
		const messageInput = interaction.options.getString('message') || ""; // For response command

		// Handling add-channel and remove-channel subcommands
		if (subcommand === 'add-channel' || subcommand === 'remove-channel') {
			// Check if the command is being used in a guild (server)
			if (!isGuild) {
				await interaction.reply("This command is only for servers.");
				return;
			}
			// Check if the user has the Manage Channels or Administrator permission
			const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
			if (!hasPermission) {
				await interaction.reply("You do not have permission to use this command.");
				return;
			}
			// Retrieve the channel object from the interaction
			const channel = interaction.options.getChannel('channel');
			const channelId = channel.id;

			// Handle adding/removing channels
			if (subcommand === 'add-channel') {
				if (!marikovdb.channels.includes(channelId)) {
					marikovdb.channels.push(channelId);
					fs.writeFileSync(path, JSON.stringify(marikovdb, null, 2));
					await interaction.reply(`Channel ${channelId} added to the list.`);
				} else {
					await interaction.reply(`Channel ${channelId} is already in the list.`);
				}
			} else if (subcommand === 'remove-channel') {
				if (marikovdb.channels.includes(channelId)) {
					marikovdb.channels = marikovdb.channels.filter(c => c !== channelId);
					fs.writeFileSync(path, JSON.stringify(marikovdb, null, 2));
					await interaction.reply(`Channel ${channelId} removed from the list.`);
				} else {
					await interaction.reply(`Channel ${channelId} is not in the list.`);
				}
			}
		} else if (subcommand === 'opt-out') {
			// Opting the user out (only allows the user to opt themselves out)
			if (!marikovdb.optedOutUsers.includes(userId)) {
				marikovdb.optedOutUsers.push(userId);
				fs.writeFileSync(path, JSON.stringify(marikovdb, null, 2));
				await interaction.reply(`You (${userId}) have been opted out.`);
			} else {
				await interaction.reply(`You are already opted out.`);
			}
		} else if (subcommand === 'opt-in') {
			// Opting the user back in (only allows the user to opt themselves back in)
			if (marikovdb.optedOutUsers.includes(userId)) {
				marikovdb.optedOutUsers = marikovdb.optedOutUsers.filter(u => u !== userId);
				fs.writeFileSync(path, JSON.stringify(marikovdb, null, 2));
				await interaction.reply(`You (${userId}) have been opted back in.`);
			} else {
				await interaction.reply(`You are not currently opted out.`);
			}
		} else if (subcommand === 'response') {
			// Handle response generation using Marikov engine
			const cleanMessage = messageInput.trim();
			
			if (!cleanMessage.length) {
				await interaction.reply("Please provide a message to generate a response from.");
				return;
			}

        		try {
          		         // Use the marikov generator to generate a response based on the user's input, omitting any mentions
           		        let response = await marikov.generateMarkovResponse(cleanMessage);  // Strip mentions
           		        response = response.replace(/<@!?[0-9]+>/g, '');  // Strip mentions from output
				await interaction.reply(response);
				
				// Log the cleaned message if the user is not opted out
				if (!marikovdb.optedOutUsers.includes(userId)) {
					const logEntry = `${cleanMessage} <@${userId}>\n`;
					fs.appendFileSync('corpus.txt', logEntry);
				}
			} catch (error) {
				console.error('Error generating response:', error);
				await interaction.reply('wuh??');
			}
		}
	},
    userApp: true, // Flag to enable adding user app mode
};


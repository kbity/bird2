const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Select a member and warn them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for warning'))
        .addStringOption(option =>
            option
                .setName('joke')
                .setDescription('Specify if the kick is a joke or not')
                .addChoices(
                    { name: 'True', value: 'true' },
                    { name: 'False', value: 'false' },
                )),
    async execute(interaction) {
        const hasKickPermission = interaction.member.permissions.has(PermissionFlagsBits.KickMembers);
        const isJoke = interaction.options.getString('joke') === 'true';

        if (!isJoke && !hasKickPermission) {
            return interaction.reply('You do not have permission to use this command.');
        }

        const member = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return interaction.reply('Please specify a valid member to warn.');
        }

        if (isJoke) {
            return interaction.reply(`🚨 | Successfully warned ${member.user.tag}\n Reason: ${reason}`);
        }

        if (hasKickPermission) {
            try {
                // Send DM to the user without performing any mod actions
                const dmMessage = new EmbedBuilder()
                    .setTitle('You have been warned')
                    .setDescription(`Reason: ${reason}`)
                    .setColor('#ffcc00');

                await member.send({ embeds: [dmMessage] });
                return interaction.reply(`🚨 | Successfully warned ${member.user.tag}\n Reason: ${reason}`);
            } catch (error) {
                console.error('Error warning member:', error);
                return interaction.reply('There was an error while trying to warn this member.');
            }
        } else {
            return interaction.reply('You do not have permission to use this command.');
        }
    },
};


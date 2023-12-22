const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for kicking'))
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
            return interaction.reply('Please specify a valid member to kick.');
        }

        if (isJoke) {
            return interaction.reply(`👟 | Successfully kicked ${member.user.tag}\n Reason: ${reason}`);
        }

        if (hasKickPermission) {
            try {
                // Send DM to the user before kicking
                const dmMessage = new EmbedBuilder()
                    .setTitle('You have been kicked')
                    .setDescription(`Reason: ${reason}`)
                    .setColor('#ffcc00');

                await member.send({ embeds: [dmMessage] });
                await member.kick(reason);
                return interaction.reply(`👟 | Successfully kicked ${member.user.tag}\n Reason: ${reason}`);
            } catch (error) {
                console.error('Error kicking member:', error);
                return interaction.reply('There was an error while trying to kick this member.');
            }
        } else {
            return interaction.reply('You do not have permission to use this command.');
        }
    },
};


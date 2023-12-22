const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning'))
        .addStringOption(option =>
            option
                .setName('joke')
                .setDescription('Specify if the ban is a joke or not')
                .addChoices(
                    { name: 'True', value: 'true' },
                    { name: 'False', value: 'false' },
                ))
        .setDefaultPermission(false),
    async execute(interaction) {
        const hasBanPermission = interaction.member.permissions.has(PermissionFlagsBits.BanMembers);
        const isJoke = interaction.options.getString('joke') === 'true';

        if (!isJoke && !hasBanPermission) {
            return interaction.reply('You do not have permission to use this command.');
        }

        const member = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return interaction.reply('Please specify a valid member to ban.');
        }

        if (isJoke) {
            return interaction.reply(`<:banhammer:1187667383108784268> | Successfully banned ${member.user.tag}\n Reason: ${reason}`);
        }

        if (hasBanPermission) {
            try {
                // Send DM to the user before banning
                const dmMessage = new EmbedBuilder()
                    .setTitle('You have been banned')
                    .setDescription(`Reason: ${reason}`)
                    .setColor('#ff0000');

                await member.send({ embeds: [dmMessage] });
                await member.ban({ reason });
                return interaction.reply(`<:banhammer:1187667383108784268> | Successfully banned ${member.user.tag}\n Reason: ${reason}`);
            } catch (error) {
                console.error('Error banning member:', error);
                return interaction.reply('There was an error while trying to ban this member.');
            }
        } else {
            return interaction.reply('You do not have permission to use this command.');
        }
    },
};


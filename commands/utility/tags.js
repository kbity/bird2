const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const tagsFilePath = path.join(__dirname, 'tagsdb.json');

const admin = '798072830595301406'; // Admin ID

function readTags() {
    const data = fs.readFileSync(tagsFilePath);
    return JSON.parse(data);
}

function writeTags(tags) {
    fs.writeFileSync(tagsFilePath, JSON.stringify(tags, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tags')
        .setDescription('Manage tags')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new tag')
                .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true))
                .addStringOption(option => option.setName('content').setDescription('The content of the tag').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View a tag')
                .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a tag')
                .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit a tag')
                .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true))
                .addStringOption(option => option.setName('content').setDescription('The new content of the tag').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all tags')
                .addIntegerOption(option => option.setName('page').setDescription('The page number').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for tags')
                .addStringOption(option => option.setName('query').setDescription('The search query').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get info of a tag')
                .addStringOption(option => option.setName('name').setDescription('The name of the tag').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unbird')
                .setDescription('Block a user from using tags')
                .addUserOption(option => option.setName('user').setDescription('The user to block').setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const name = interaction.options.getString('name');
        const content = interaction.options.getString('content');
        const page = interaction.options.getInteger('page') || 1;
        const query = interaction.options.getString('query');
        const user = interaction.options.getUser('user');
        const userId = interaction.user.id;

        let tagsData = readTags();

        // Check if the user is blocked
        if (tagsData.blockedUsers.includes(userId) && subcommand !== 'unbird') {
            return interaction.reply({ content: 'You are blocked from using tags.', allowedMentions: { parse: [] } });
        }

        switch (subcommand) {
            case 'create':
                if (tagsData.tags.some(tag => tag.name === name)) {
                    return interaction.reply({ content: `A tag with the name "${name}" already exists.`, allowedMentions: { parse: [] } });
                }
                tagsData.tags.push({ name, content, owner: userId });
                writeTags(tagsData);
                return interaction.reply({ content: `Tag "${name}" created successfully.`, allowedMentions: { parse: [] } });
            case 'view':
                const tag = tagsData.tags.find(tag => tag.name === name);
                if (!tag) {
                    return interaction.reply({ content: `No tag found with the name "${name}".`, allowedMentions: { parse: [] } });
                }
                return interaction.reply({ content: tag.content, allowedMentions: { parse: [] } });
            case 'delete':
                const tagIndex = tagsData.tags.findIndex(tag => tag.name === name);
                if (tagIndex === -1) {
                    return interaction.reply({ content: `No tag found with the name "${name}".`, allowedMentions: { parse: [] } });
                }
                if (tagsData.tags[tagIndex].owner !== userId && userId !== admin) {
                    return interaction.reply({ content: `You do not have permission to delete this tag.`, allowedMentions: { parse: [] } });
                }
                tagsData.tags.splice(tagIndex, 1);
                writeTags(tagsData);
                return interaction.reply({ content: `Tag "${name}" deleted successfully.`, allowedMentions: { parse: [] } });
            case 'edit':
                const tagToEdit = tagsData.tags.find(tag => tag.name === name);
                if (!tagToEdit) {
                    return interaction.reply({ content: `No tag found with the name "${name}".`, allowedMentions: { parse: [] } });
                }
                if (tagToEdit.owner !== userId) {
                    return interaction.reply({ content: `You do not have permission to edit this tag.`, allowedMentions: { parse: [] } });
                }
                tagToEdit.content = content;
                writeTags(tagsData);
                return interaction.reply({ content: `Tag "${name}" edited successfully.`, allowedMentions: { parse: [] } });
            case 'list':
                const tags = tagsData.tags.slice((page - 1) * 15, page * 15);
                if (tags.length === 0) {
                    return interaction.reply({ content: `No tags found.`, allowedMentions: { parse: [] } });
                }
                return interaction.reply({ content: tags.map(tag => tag.name).join(', '), allowedMentions: { parse: [] } });
            case 'search':
                const searchResults = tagsData.tags.filter(tag => tag.name.includes(query));
                if (searchResults.length === 0) {
                    return interaction.reply({ content: `No tags found matching "${query}".`, allowedMentions: { parse: [] } });
                }
                return interaction.reply({ content: searchResults.map(tag => tag.name).join(', '), allowedMentions: { parse: [] } });
            case 'info':
                const tagInfo = tagsData.tags.find(tag => tag.name === name);
                if (!tagInfo) {
                    return interaction.reply({ content: `No tag found with the name "${name}".`, allowedMentions: { parse: [] } });
                }
                return interaction.reply({ content: `**Name:** ${tagInfo.name}\n**Content:** ${tagInfo.content}\n**Owner:** <@${tagInfo.owner}>`, allowedMentions: { parse: [] } });
            case 'unbird':
                if (userId !== admin) {
                    return interaction.reply({ content: 'You do not have permission to block users.', allowedMentions: { parse: [] } });
                }
                if (!tagsData.blockedUsers.includes(user.id)) {
                    tagsData.blockedUsers.push(user.id);
                    writeTags(tagsData);
                    return interaction.reply({ content: `User <@${user.id}> has been blocked from using tags.`, allowedMentions: { parse: [] } });
                } else {
                    return interaction.reply({ content: `User <@${user.id}> is already blocked.`, allowedMentions: { parse: [] } });
                }
            default:
                return interaction.reply({ content: 'Invalid subcommand.', allowedMentions: { parse: [] } });
        }
    },
    userApp: true, // Flag to enable adding user app mode
};


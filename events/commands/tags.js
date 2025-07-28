const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

const prefix = config.prefix;
const admin = config.tagsAdmin;
const tagsFilePath = path.join(__dirname, '../../tagsdb.json');

function readTags() {
    const data = fs.readFileSync(tagsFilePath);
    return JSON.parse(data);
}

function writeTags(tags) {
    fs.writeFileSync(tagsFilePath, JSON.stringify(tags, null, 2));
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'cabbage') {
            return await message.reply('https://cdn.discordapp.com/attachments/806268326031917067/1218060235135254588/cabbagepultchickent2.png');
        }

        if (command !== 'tags') return;

        const subcommand = args.shift()?.toLowerCase();
        const userId = message.author.id;
        const tagsData = readTags();

        if (tagsData.blockedUsers.includes(userId) && subcommand !== 'unbird') {
            return message.reply('You are blocked from using tags.');
        }

        const name = args[0];
        const content = args.slice(1).join(' '); // for subcommands like create/edit
        const page = parseInt(args[0]) || 1;
        const query = args.join(' ');

        switch (subcommand) {
            case 'create': {
                if (!name || !content) return message.reply('Usage: `!tags create <name> <content>`');
                if (tagsData.tags.some(tag => tag.name === name)) return message.reply(`A tag with the name "${name}" already exists.`);
                tagsData.tags.push({ name, content, owner: userId });
                writeTags(tagsData);
                return message.reply(`Tag "${name}" created successfully.`);
            }

            case 'view': {
                if (!name) return message.reply('Usage: `!tags view <name>`');
                const tag = tagsData.tags.find(tag => tag.name === name);
                return message.reply(tag ? tag.content : `No tag found with the name "${name}".`);
            }

            case 'delete': {
                if (!name) return message.reply('Usage: `!tags delete <name>`');
                const tagIndex = tagsData.tags.findIndex(tag => tag.name === name);
                if (tagIndex === -1) return message.reply(`No tag found with the name "${name}".`);
                if (tagsData.tags[tagIndex].owner !== userId && userId !== admin) {
                    return message.reply('You do not have permission to delete this tag.');
                }
                tagsData.tags.splice(tagIndex, 1);
                writeTags(tagsData);
                return message.reply(`Tag "${name}" deleted successfully.`);
            }

            case 'edit': {
                if (!name || !content) return message.reply('Usage: `!tags edit <name> <new content>`');
                const tag = tagsData.tags.find(tag => tag.name === name);
                if (!tag) return message.reply(`No tag found with the name "${name}".`);
                if (tag.owner !== userId) return message.reply('You do not have permission to edit this tag.');
                tag.content = content;
                writeTags(tagsData);
                return message.reply(`Tag "${name}" edited successfully.`);
            }

            case 'list': {
                const tags = tagsData.tags.slice((page - 1) * 15, page * 15);
                if (tags.length === 0) return message.reply('No tags found.');
                return message.reply(tags.map(tag => tag.name).join(', '));
            }

            case 'search': {
                if (!query) return message.reply('Usage: `!tags search <query>`');
                const results = tagsData.tags.filter(tag => tag.name.includes(query));
                return message.reply(results.length > 0 ? results.map(tag => tag.name).join(', ') : `No tags found matching "${query}".`);
            }

            case 'info': {
                if (!name) return message.reply('Usage: `!tags info <name>`');
                const tag = tagsData.tags.find(tag => tag.name === name);
                if (!tag) return message.reply(`No tag found with the name "${name}".`);
                return message.reply(`**Name:** ${tag.name}\n**Content:** ${tag.content}\n**Owner:** <@${tag.owner}>`);
            }

            case 'unbird': {
                if (userId !== admin) return message.reply('You do not have permission to block users.');
                const targetUser = message.mentions.users.first();
                if (!targetUser) return message.reply('Usage: `!tags unbird @user`');
                if (!tagsData.blockedUsers.includes(targetUser.id)) {
                    tagsData.blockedUsers.push(targetUser.id);
                    writeTags(tagsData);
                    return message.reply(`User <@${targetUser.id}> has been blocked from using tags.`);
                } else {
                    return message.reply(`User <@${targetUser.id}> is already blocked.`);
                }
            }

            default:
                return message.reply('Invalid subcommand. Try: `create`, `view`, `delete`, `edit`, `list`, `search`, `info`, `unbird`');
        }
    }
};

const { SlashCommandBuilder } = require('discord.js');
const whitelist = require('./eval-whitelist.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Executes provided code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to execute')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('ephemeral')
        .setDescription('Whether the response should be ephemeral')),
  async execute(interaction) {
    const userId = interaction.user.id;

    if (!whitelist.includes(userId)) {
      return interaction.reply({ content: 'https://eval-deez-nuts.xyz/', ephemeral: true });
    }

    const code = interaction.options.getString('code');
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

    try {
      let logs = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
      };

      let result = eval(code);
      if (result instanceof Promise) {
        result = await result;
      }

      await interaction.reply({ content: `\`\`\`js\n${logs.join('\n')}\n${result !== undefined ? result : ''}\n\`\`\``, ephemeral });
    } catch (error) {
      await interaction.reply({ content: `Error: \`\`\`js\n${error.message}\n\`\`\``, ephemeral });
    }
  },
  userApp: true,
};

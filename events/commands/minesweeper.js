const { Events } = require('discord.js');
const { prefix } = require('../../config.json');
const config = require('../../config.json');
const AchievementHandler = require('../../achievementHandler');
const achHandler = new AchievementHandler();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
      if (!message.content.startsWith(prefix)) return;
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      if (command === 'minesweeper') {
      // Respond to the command with a fake minesweeper gui
      await message.reply(`# \`010\`${config.emojis.gray}${config.emojis.gray}${config.emojis.guy}${config.emojis.gray}${config.emojis.gray}\`000\``);
      // Generate the Minesweeper board
      const minesweeperBoard = generateMinesweeperBoard();
      // Convert the board to Discord emojis wrapped in spoiler tags
      const discordBoard = convertToDiscordEmojis(minesweeperBoard);
      // Convert to string
      let stringed = discordBoard.toString();
      let rows = stringed.split(',');
      // Split the rows into two parts
      const halfIndex = Math.ceil(rows.length / 2);
      const firstHalf = rows.slice(0, halfIndex).join('\n');
      const secondHalf = rows.slice(halfIndex).join('\n');
      // Send the first half as a normal message
      const channelId = message.channelId; // Get the channel ID where the command was executed
      const channel = await message.client.channels.fetch(channelId);
      const firstHalfMessage = await channel.send(firstHalf);
      // Send the second half as a normal message
      const secondHalfMessage = await channel.send(secondHalf);
      // React to the second half message
      await secondHalfMessage.react(config.emojis.flag);
      await secondHalfMessage.react(config.emojis.loss);
      const userId = message.author.id;
      const achievementGranted = achHandler.grantAchievement(userId, 8, message);}
    },
};

// Function to generate Minesweeper board
function generateMinesweeperBoard() {
  const boardSize = 9;
  const totalMines = 10;
  const board = [];
  // Initialize the board with empty cells
  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      board[i][j] = 0;
    }
  }
  // Place mines randomly on the board, avoiding the top left corner and its three adjacent tiles
  const safeCells = new Set();
  safeCells.add('0,0');
  for (let row = 0; row <= 1; row++) {
    for (let col = 0; col <= 1; col++) {
      safeCells.add(`${row},${col}`);
    }
  }
  let minesPlaced = 0;
  while (minesPlaced < totalMines) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    const cellKey = `${row},${col}`;
    
    if (!safeCells.has(cellKey) && board[row][col] !== 'M') {
      board[row][col] = 'M';
      minesPlaced++;
    }
  }
  // Calculate the number of adjacent mines for each cell
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] !== 'M') {
        let count = 0;
        // Check adjacent cells
        for (let row = i - 1; row <= i + 1; row++) {
          for (let col = j - 1; col <= j + 1; col++) {
            if (
              row >= 0 &&
              row < boardSize &&
              col >= 0 &&
              col < boardSize &&
              board[row][col] === 'M'
            ) {
              count++;
            }
          }
        }
        board[i][j] = count;
      }
    }
  }
  return board;
}

// Function to convert board to Discord emojis
function convertToDiscordEmojis(board) {
  const emojis = config.emojis;
  const discordBoard = [];

  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    let discordRow = '';
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell === 'M') {
        discordRow += emojis.mine;
      } else {
        discordRow += emojis[cell];
      }
    }
    discordBoard.push(discordRow);
  }

  return discordBoard;
}

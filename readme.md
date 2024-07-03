1. replace the dummy token and application/client ID with the bot token and application/client ID in config.json
2. run `npm install` to download needed libraries and packages
3. edit config.json and add in the bot token and client/Application ID, also the UserID of the bot
4. (optional) go to commands/utility and edit the say-whitelist.json, this is users who can use /say without needing admin perms in the server
5. (optional) go into commands/anime/gifs to add/edit/remove anime gifs from the ***-gifs.json files
6. (recomended for full funcionality) to into commands/fun and edit minesweeper.js and minesweeper-help.js and replace the custom server emojis with either your own, or generic ones, in order to get commands working correctly
7. (recomended for full funcionality) edit... birds.json and birddata.json and replace the birds with your own, in birddata.json keep unknown bird
8. run `node deploy-commands.js` to deploy the Commands
9. run `npm start` or `node .` to run the bot

auth link for offical bot: https://discord.com/api/oauth2/authorize?client_id=1118256931040149626&permissions=137439333446&scope=bot+applications.commands

bird versioning scheme\n
ex: 2.3.0b:\n
Major - bird 2 - Bird written with Discord.js\n
Minor bird v2.3.x - Line of bird versions most notable for adding automatically spawning birds and Progressbird95\n
Patch - bird v2.3.0 - bird v2.3.x without the bug fixes of v2.3.1 and v2.3.2\n
Minipatch - bird v2.3.0b - bird v2.3.0 without the broken version of /Progressbird95\n


ex: 2.3.2b:\n
Major - bird 2 - Bird written with Discord.js\n
Minor bird v2.3.x - Line of bird versions most notable for adding automatically spawning birds and Progressbird95\n
Patch - bird v2.3.2 - fixes major spawning bug from v2.3.1, which fixed the Progressbird95 crashing bug\n
Minipatch - bird v2.3.2b - bird v2.3.2 with fixed autobird.\n

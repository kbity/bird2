# notice
bird 2.x will no longer be maintained or updated. please use bird 3.x when it is available.

# setup instructions

1. run `npm install` to download needed libraries and packages
2. run `npm run conf` for configuration cli. run commands restore, emojisync, cmdsync, startupmsg channel {channelId}, and tagsadmin {userId}. run migratedb if you have previous database stuff
3. (optional) edit birds.json and data.json and replace the birds with your own. in data.json keep unknown bird
4. (optional) go into commands/anime/gifs to add/edit/remove anime gifs from the ***-gifs.json files
5. run `npm start` or `node .` to run the bot, or do run in the config cli

auth link for offical bot: https://discord.com/api/oauth2/authorize?client_id=1118256931040149626&permissions=137439333446&scope=bot+applications.commands

# bird versioning scheme

Major is a codebase change<br>
Minor is a major feature update<br>
Patch is bug fixes and minor features

Minipatches are tiny updates.<br>
assume all versions without the minipatch present have an a, like v2.2.1a. a minipatch increments the letter, so a mimipached v2.2.1 is v2.2.1b, and adding a second would make v2.2.1c, etc

ex: 2.3.0b:

Major - bird 2 - Bird written with Discord.js<br>
Minor - bird v2.3.x - Line of bird versions most notable for adding automatically spawning birds and Progressbird95<br>
Patch - bird v2.3.0 - bird v2.3.x without the bug fixes of v2.3.1 and v2.3.2



ex: 2.3.2b:

Major - bird 2 - Bird written with Discord.js<br>
Minor - bird v2.3.x - Line of bird versions most notable for adding automatically spawning birds and Progressbird95<br>
Patch - bird v2.3.2 - fixes major spawning bug from v2.3.1, which fixed the Progressbird95 crashing bug<br>
Minipatch - bird v2.3.2b - bird v2.3.2 with fixed autobird.



ex: v2.0.0:

Major - bird 2 - Bird written with Discord.js<br>
Minor - bird v2.0.x - Original bird2, no updates<br>
Patch - bird v2.0.0 - Original bird2, no updates

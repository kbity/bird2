const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { execSync } = require('child_process');
try {
    const AdmZip = require('adm-zip');
}
catch {
    console.error("\x1b[31mFatal Error: please install adm-zip by running \`npm install adm-zip\`\x1b[0m");
    return;
}
const AdmZip = require('adm-zip');

const requiredPackages = ['discord.js', 'adm-zip', 'fast-levenshtein', 'axios', 'node-fetch', 'proper-lockfile'];
const configPath = './config.json';

// Function to check for missing npm packages
function checkPackages() {
    console.log("Checking required npm packages...");
    let missingPackages = [];
    
    requiredPackages.forEach(pkg => {
        try {
            require.resolve(pkg);
        } catch (e) {
            missingPackages.push(pkg);
        }
    });

    if (missingPackages.length > 0) {
        console.log("Missing packages detected:", missingPackages.join(", "));
        console.log("Run the following command to install them:");
        console.log(`npm install ${missingPackages.join(" ")}`);
        process.exit(1);
    }
    console.log("All required packages are installed.\n");
}

// Function to initialize config.json if it doesn't exist
function initializeConfig() {
    if (!fs.existsSync(configPath)) {
        console.log("Initializing configuration file...");
        const defaultConfig = {
            "token": "(Unconfigured!)",
            "tggtoken": "None",
            "clientId": "(Unconfigured!)",
            "startupMessageChannel": "(Unconfigured!)",
            "tagsAdmin": "(Unconfigured!)",
            "prefix": "bird!",
            "minSpawnTime": 5,
            "maxSpawnTime": 15,
            "startupMessages": ["Bot Started (you can edit this in config)"],
            "evalWhitelist": [],
            "sayWhitelist": [],
            "emojis": {
                "fullStar": "(Unconfigured!)",
                "halfStar": "(Unconfigured!)",
                "emptyStar": "(Unconfigured!)",
                "bird": "(Unconfigured!)",
                "0": "(Unconfigured!)",
                "1": "(Unconfigured!)",
                "2": "(Unconfigured!)",
                "3": "(Unconfigured!)",
                "4": "(Unconfigured!)",
                "5": "(Unconfigured!)",
                "6": "(Unconfigured!)",
                "7": "(Unconfigured!)",
                "8": "(Unconfigured!)",
                "mine": "(Unconfigured!)",
                "flag": "(Unconfigured!)",
                "loss": "(Unconfigured!)",
                "gray": "(Unconfigured!)",
                "guy": "(Unconfigured!)",
                "pbgray": "(Unconfigured!)",
                "blue": "(Unconfigured!)",
                "orange": "(Unconfigured!)",
                "red": "(Unconfigured!)",
                "rand": "(Unconfigured!)",
                "pink": "(Unconfigured!)",
                "lblu": "(Unconfigured!)",
                "gree": "(Unconfigured!)",
                "catch": "(Unconfigured!)",
                "bird": "(Unconfigured!)",
                "fail": "(Unconfigured!)",
                "professor": "(Unconfigured!)",
                "wronganimal": "(Unconfigured!)"
            }
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
        console.log("Config file created.\n");
    }
}

// Function to update the config with user input
function configureBot() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Only prompt for the token if it's unconfigured
    if (config.token === "(Unconfigured!)") {
        rl.question("Enter your bot token: ", (token) => {
            config.token = token;
            try {
                config.clientId = Buffer.from(token.split('.')[0], 'base64').toString('utf8'); // Decode client ID from base64
            } catch (e) {
                console.error("Failed to decode client ID.");
                config.clientId = "(Unconfigured!)";
            }
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            console.log("Configuration updated successfully.\n");
            rl.close();
            startCLI();  // Restart the CLI after configuration
        });
    } else {
        console.log("Bot token is already configured.");
        rl.close();
        startCLI();  // Proceed to CLI after token is set
    }
}

// Simple CLI loop
function startCLI() {
    console.log("Welcome to BirdConfCLI!");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function getFormattedTimestamp() {
        const now = new Date();
        const yyyy = now.getFullYear().toString();
        const MM = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd = now.getDate().toString().padStart(2, '0');
        const HH = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        return `${yyyy}${MM}${dd}${HH}${mm}`;
    }

    function prompt() {
        rl.question("BirdConfCLI> ", (cmd) => {
            const [command, ...args] = cmd.split(" ");
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            switch (command.toLowerCase()) {
                case "exit":
                    console.log("Exiting CLI...");
                    rl.close();
                    return;
                case "ping":
                    console.log("basically 0ms this is running locally why did you do that");
                    break;
                case "emojisync":
                    execSync('node cmdlets/emojisync.js', { stdio: 'inherit' });
                    break;
                case "migratedb":
                    execSync('node cmdlets/dbmigrate.js', { stdio: 'inherit' });
                    break;
                case "cmdsync":
                    execSync('node cmdlets/deploy-commands.js', { stdio: 'inherit' });
                    break;
                case "run":
                    execSync('node .', { stdio: 'inherit' });
                    break;
                case "echo":
                    console.log(args.join(" "));
                    break;
                case "tagsadmin":
                    config.tagsAdmin = args[0];
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                    console.log(`Tags Admin set to user ${args[0]}`);
                    break;
                case "wipe":
                    rl.question('Are you sure you want to delete ALL Data? (type "Yes, Delete ALL Data!") to confirm: ', (answer) => {
                        if (answer === "Yes, Delete ALL Data!") {
                            try {
                                fs.unlinkSync('tagsdb.json');
                                console.log("Deleted Tags DB")
                            } catch (err) {
                                console.error(`Failed to Delete Tags DB, ${err}`)
                            }
                            deleteFolder('./per_user');
                            deleteFolder('./per_server');
                            try {
                                fs.unlinkSync('config.json');
                                console.log("Deleted Config")
                            } catch (err) {
                                console.error(`Failed to Delete Config, ${err}`)
                            }
                            console.log("It is done.");
                            rl.close();
                            return
                        } else {
                            console.log("Abort. No data deleted.");
                            rl.close();
                            startCLI();
                        }
                    });
                    break;
                case "startupmsg":
                    const subcommand = args.shift();
                    switch (subcommand) {
                        case "channel":
                            config.startupMessageChannel = args[0];
                            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                            console.log(`Startup message channel ID set to ${args[0]}`);
                            break;
                        case "add":
                            config.startupMessages.push(args.join(" "));
                            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                            console.log("Startup message added.");
                            break;
                        case "remove":
                            const index = parseInt(args[0], 10);
                            if (index >= 0 && index < config.startupMessages.length) {
                                config.startupMessages.splice(index, 1);
                                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                                console.log("Startup message removed.");
                            } else {
                                console.log("Invalid message index.");
                            }
                            break;
                        case "list":
                            console.log("Startup messages:");
                            config.startupMessages.forEach((msg, idx) => {
                                console.log(`${idx}: ${msg}`);
                            });
                            break;
                        default:
                            console.log("Invalid startupmsg subcommand.");
                    }
                    break;
                break;
                case "eval":
                    const evalSubcommand = args.shift();
                    switch (evalSubcommand) {
                        case "add":
                            config.evalWhitelist.push(args.join(" "));
                            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                            console.log("Eval user added.");
                            break;
                        case "remove":
                            const index = parseInt(args[0], 10);
                            if (index >= 0 && index < config.evalWhitelist.length) {
                                config.evalWhitelist.splice(index, 1);
                                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                                console.log("Eval user removed.");
                            } else {
                                console.log("Invalid Eval user.");
                            }
                            break;
                        case "list":
                            console.log("Eval users:");
                            config.evalWhitelist.forEach((msg, idx) => {
                                console.log(`${idx}: ${msg}`);
                            });
                            break;
                        default:
                            console.log("Invalid eval subcommand.");
                    }
                break;
                case "say":
                    const saySubcommand = args.shift();
                    switch (saySubcommand) {
                        case "add":
                            config.sayWhitelist.push(args.join(" "));
                            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                            console.log("Say user added.");
                            break;
                        case "remove":
                            const index = parseInt(args[0], 10);
                            if (index >= 0 && index < config.sayWhitelist.length) {
                                config.sayWhitelist.splice(index, 1);
                                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                                console.log("Say user removed.");
                            } else {
                                console.log("Invalid Say user.");
                            }
                            break;
                        case "list":
                            console.log("Say users:");
                            config.sayWhitelist.forEach((msg, idx) => {
                                console.log(`${idx}: ${msg}`);
                            });
                            break;
                        default:
                            console.log("Invalid say subcommand.");
                    }
                break;
                case "backup":
                    backupFiles();
                    break;
                case "restore":
                    restoreFiles();
                    break;
                case "help":
                    console.log("Available commands:");
                    console.log("  exit - Exit the CLI");
                    console.log("  ping - Test the ping command");
                    console.log("  emojisync - Syncs main emojis from the emoji folder to Discord.");
                    console.log("  cmdsync - Sync commands to discord");
                    console.log("  run - Runs the bot");
                    console.log("  echo {message} - Echo the message back");
                    console.log("  tagsadmin {id} - Sets user ID of Tags Admin");
                    console.log("  startupmsg channel {id} - Set the startup message channel ID");
                    console.log("  startupmsg add {message} - Add a new startup message");
                    console.log("  startupmsg remove {index} - Remove a startup message by index");
                    console.log("  startupmsg list - List all startup messages");
                    console.log("  eval add {user} - Add a new eval user");
                    console.log("  eval remove {index} - Remove an eval user by index");
                    console.log("  eval list - List all eval users");
                    console.log("  say add {message} - Add a new say user");
                    console.log("  say remove {index} - Remove an say user by index");
                    console.log("  say list - List all say users");
                    console.log("  backup - Create a backup of Database");
                    console.log("  restore - Restore Database Files from Newest Backup");
                    console.log("  migratedb - transfer old database files to new database (load the empty backup first)");
                    console.log("  wipe - [DANGER!] removes all data");
                    break;
                default:
                    console.log(`Unrecognized command: ${cmd}`);
            }
            prompt();
        });
    }

    prompt();  // Start the first prompt
}

function getFormattedTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:]/g, '-').replace(/\..+/, '');
}


function backupFiles() {
    const timestamp = getFormattedTimestamp();
    const zip = new AdmZip();

    const filesToBackup = ['tagsdb.json'];
    const foldersToBackup = ['per_user', 'per_server'];

    filesToBackup.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            zip.addLocalFile(filePath);
            console.log(`Added file to backup: ${file}`);
        } else {
            console.log(`File not found: ${file}`);
        }
    });

    foldersToBackup.forEach(folder => {
        const folderPath = path.join(__dirname, folder);
        if (fs.existsSync(folderPath)) {
            zip.addLocalFolder(folderPath, folder); // keep folder structure
            console.log(`Added folder to backup: ${folder}`);
        } else {
            console.log(`Folder not found: ${folder}`);
        }
    });

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const zipPath = path.join(backupDir, `${timestamp}.zip`);
    zip.writeZip(zipPath);

    console.log(`Backup complete: ${zipPath}`);
}

function restoreFiles() {
    const backupDir = path.join(__dirname, 'backups');
    const backupZips = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.zip'))
        .sort()
        .reverse();

    if (backupZips.length === 0) {
        console.log('No backup zips found.');
        return;
    }

    const mostRecentZip = path.join(backupDir, backupZips[0]);
    const zip = new AdmZip(mostRecentZip);
    zip.extractAllTo(__dirname, true);
    console.log(`Restored from backup: ${mostRecentZip}`);
}

function deleteFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
        for (const file of fs.readdirSync(folderPath)) {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath); // recurse
            } else {
                fs.unlinkSync(curPath); // delete file
            }
        }
        fs.rmdirSync(folderPath); // delete now-empty folder
    }
}

// Run setup steps
checkPackages();
initializeConfig();
configureBot();


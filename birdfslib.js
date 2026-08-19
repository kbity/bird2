const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const lockfile = require('proper-lockfile');

// Ensure file exists (atomic, async-safe)
async function fileExists(filePath) {
    try {
        await fsp.access(filePath);
    } catch {
        try {
            await fsp.writeFile(filePath, '{}');
        } catch (err) {
            console.error(`Failed to create file ${filePath}:`, err);
        }
    }
}

// Load JSON from file with optional retry on failure
async function loadJsonFile(filePath, retries = 3, delayMs = 50) {
    await fileExists(filePath);

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const release = await lockfile.lock(filePath);
            const data = await fsp.readFile(filePath, 'utf8');
            await release();
            return JSON.parse(data);
        } catch (err) {
            if (attempt === retries - 1) {
                console.error(`Error loading file ${filePath}:`, err);
                return {};
            }
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
}

// Save JSON to file with lock
async function saveJsonFile(filePath, data) {
    try {
        const release = await lockfile.lock(filePath);
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
        await release();
    } catch (err) {
        console.error(`Error saving file ${filePath}:`, err);
    }
}

// Load channel data for a server
async function loadChannels(serverId) {
    const filePath = `./per_server/${serverId}.json`;
    const data = await loadJsonFile(filePath);
    return new Map(Object.entries(data));
}

// Save channel data for a server
async function saveChannels(serverId, channels) {
    const filePath = `./per_server/${serverId}.json`;
    await fileExists(filePath);
    await saveJsonFile(filePath, Object.fromEntries(channels));
}

// Load inventories for a user
async function loadInventories(userId) {
    const filePath = `./per_user/${userId}.json`;
    const data = await loadJsonFile(filePath);
    return new Map(Object.entries(data));
}

// Save inventories for a user
async function saveInventories(userId, inventories) {
    const filePath = `./per_user/${userId}.json`;
    await fileExists(filePath);
    await saveJsonFile(filePath, Object.fromEntries(inventories));
}

const version = "v2.5.0"

module.exports = {
    loadJsonFile,
    saveJsonFile,
    loadChannels,
    saveChannels,
    loadInventories,
    saveInventories,
    fileExists,
    version
};


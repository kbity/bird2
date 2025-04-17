const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const channelFilePath = './channels.json';
const inventoryFilePath = './inventories.json';
const birdsFilePath = './birds.json';

// Load JSON from file
async function loadJsonFile(filePath) {
    try {
        const data = await fsp.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading file ${filePath}:`, err);
        return {};
    }
}

// Save JSON to file
async function saveJsonFile(filePath, data) {
    try {
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error saving file ${filePath}:`, err);
    }
}

// Load channels from file
async function loadChannels() {
    const data = await loadJsonFile(channelFilePath);
    return new Map(Object.entries(data || {}));
}

// Save channels to file
async function saveChannels(channels) {
    await saveJsonFile(channelFilePath, Object.fromEntries(channels));
}

// Load inventories from file
async function loadInventories() {
    const data = await loadJsonFile(inventoryFilePath);
    return new Map(Object.entries(data || {}));
}

// Save inventories to file
async function saveInventories(inventories) {
    await saveJsonFile(inventoryFilePath, Object.fromEntries(inventories));
}

module.exports = {
    loadJsonFile,
    saveJsonFile,
    loadChannels,
    saveChannels,
    loadInventories,
    saveInventories,
    birdsFilePath
};

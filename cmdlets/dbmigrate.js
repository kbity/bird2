const fs = require('fs/promises');
const path = require('path');

const inventoriesPath = './inventories.json';
const achievementsPath = './achdb.json';
const perUserDir = './per_user';

async function loadJson(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Failed to load ${filePath}:`, err);
        return {};
    }
}

function mergeInventoriesToProfile(profile, inventory) {
    profile.bird = profile.bird || {};
    for (const [key, value] of Object.entries(inventory)) {
        if (typeof value === 'number') {
            if (key === 'fastestTime') {
                profile.fastestTime = Math.min(profile.fastestTime ?? Infinity, value);
            } else if (key === 'slowestTime') {
                profile.slowestTime = Math.max(profile.slowestTime ?? 0, value);
            } else if (key === 'lastclaim') {
                profile.lastclaim = Math.max(profile.lastclaim ?? 0, value);
            } else {
                profile.bird[key] = (profile.bird[key] || 0) + value;
            }
        }
    }
}

function mergeAchievements(profile, achievements) {
    profile.achs = Array.from(new Set([...(profile.achs || []), ...achievements])).sort((a, b) => a - b);
}

async function runMigration() {
    const inventories = await loadJson(inventoriesPath);
    const achdb = await loadJson(achievementsPath);

    await fs.mkdir(perUserDir, { recursive: true });

    const allUserIds = new Set([
        ...Object.keys(inventories),
        ...Object.keys(achdb.users || {})
    ]);

    for (const userId of allUserIds) {
        const inventory = inventories[userId] || {};
        const achievements = (achdb.users || {})[userId] || [];

        const userPath = path.join(perUserDir, `${userId}.json`);
        let existingProfile = {};

        try {
            const existing = await fs.readFile(userPath, 'utf8');
            existingProfile = JSON.parse(existing);
        } catch (e) {
            // no existing file, that's fine
        }

        mergeInventoriesToProfile(existingProfile, inventory);
        mergeAchievements(existingProfile, achievements);

        await fs.writeFile(userPath, JSON.stringify(existingProfile, null, 2));
        console.log(`✔ Merged profile for user ${userId}`);
    }
}

runMigration().catch(console.error);

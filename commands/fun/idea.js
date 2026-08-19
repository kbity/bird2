const { SlashCommandBuilder } = require('discord.js');

const sizes = ["microscopic", "pocket-sized", "tiny", "mini", "slim", "normally sized", "big", "gigantic", "rideable", "inhabitable", "beaver-sized", "comically oversized"]
const energys = ["steam", "hamster", "wall", "water", "wind", "solar", "heat", "hand", "feet", "nuclear", "non"]
const devices = ["toaster", "computer", "hair drier", "wrench", "lightbulb", "screwdriver", "hammer", "boat", "car", "containment chamber", "plate", "spoon", "hard drive", "fan", "submarine", "bowl", "toilet", "remote"]
const materials = ["plastic", "paper", "sand", "metal", "wood", "meat", "plants", "rubber", "rocks", "crystals", "fabric", "bread", "glass", "rice", "hot glue", "cardboard"]
const actions = ["saves lives", "fixes everything", "does absolutely nothing", "blows air", "plays games", "lets you eat out of it", "locks away rouge AI", "tames fish", "makes noises", "smashes lightbulbs", "turns rubber into lettuce", "pops", "cannot be shipped via UPS", "has no reason to exist", "must be able to comply with OSHA", "can be twisted from the top", "contains lead", "eliminates odors", "deals with pests", "is recommended by doctors", "cleans things", "solves the 4 moves problem", "plays half-life: source", "makes strange sounds when hit with a hammer", "causes sleep deprevation", "is known to cause cancer and reproductive harm in the state of california", "rolls around randomly"]
const reasons = ["because it can", "for no reason in particular", "for the betterment of mankind", "because 1 person thought it useful", "because it solves a problem", "just to make everyone's life worse", "out of convenience", "out of necessity", "because the beavers hate us", "because i found iron in john's basement"]

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('idea')
		.setDescription('generates a VERY silly idea'),
	async execute(interaction) {
        const size = randomItem(sizes)
        const energy = randomItem(energys)
        const device = randomItem(devices)
        const material = randomItem(materials)
        const action = randomItem(actions)
        const reason = randomItem(reasons)
		try {await interaction.reply(`a ${size} ${energy}-powered ${device} made of ${material} that ${action} ${reason}!`);}
        catch {await interaction.channel.send(`a ${size} ${energy}-powered ${device} made of ${material} that ${action} ${reason}!`);}
	},
    userApp: true, // Flag to enable adding user app mode
};


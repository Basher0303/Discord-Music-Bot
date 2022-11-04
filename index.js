const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, EmbedBuilder } = require('discord.js');
const { token, weatherApiKey } = require('./config.json');
const { DisTube } = require("distube");
const deployCommands = require("./deploy-commands");

//All 
const client = new Client({ 
	intents: 32767
});

let message;

client.DisTube = new DisTube(client, {
	leaveOnStop: false,
	emitNewSongOnly: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
});

client.DisTube
	.on('playSong', async (queue, song) => {
		const embed = new EmbedBuilder()
			.setAuthor({ name: `Сейчас играет:`})
			.setTitle(song.name)
			.setThumbnail(song.thumbnail)
			.addFields(
				{ name: 'Длительность: ', value: song.formattedDuration, inline: true },
			);
		if(message == null) 
			message = queue.textChannel.send({ embeds: [embed] });
		else
			message.update({ embeds: [embed] });
			
	})
	.on('addSong', async (queue, song) => {
		console.log(song);
		const msg = queue.textChannel.send(`Песня ${song.name} добавлена в очередь.`);
		setInterval(() => {
			msg.delete();
		}, 5000);
	});


//Read Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


//Read events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('guildCreate', async (guild) => {
	deployCommands(guild.id);
})


client.login(token);

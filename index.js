const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, EmbedBuilder } = require('discord.js');
const { token, weatherApiKey } = require('./config.json');
const { DisTube } = require("distube");
const deployCommands = require("./deploy-commands");
const { asyncAddReacts } = require('./functions');

//All 
const client = new Client({ 
	intents: 32767
});

let serversInfo = [];

client.serversInfo = serversInfo;


client.DisTube = new DisTube(client, {
	leaveOnFinish: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
});


function getPlayerEmbed(queue) {
	const firstSong = queue.songs[0];
	let queueFormatted = [];

	queue.songs.forEach((item, index) => {
		if(index != 0)
			queueFormatted.push({ name: `${index}. ${item.name}`, value: `\`${item.formattedDuration}\``});
	});

	queue.songs
	const embed = new EmbedBuilder()
		.setTitle(firstSong.name)
		.setURL(firstSong.url)
		.setColor(queue.paused ? 0xdb0d63 : 0x0ddb60)
		.setDescription(`\`${firstSong.formattedDuration}\``)
		.setThumbnail(firstSong.thumbnail)
		.addFields(
			{ name: 'Длительность ', value: `\`${firstSong.formattedDuration}\``, inline: true },
			{ name: 'Статус ', value: `\`${queue.paused ? 'Пауза' : 'Играет'}\``, inline: true },
			{ name: 'Повторение', value: `\`${queue.repeatMode == 1 ? 'Включено' : 'Выключено'}\``, inline: true },
		)
		.addFields(
			queueFormatted.length > 0 ? [{ name: '\u200B', value: '\u200B', inline: true },
			{ name: '\u200B', value: `Очередь (${queue.songs.length - 1})`, inline: true },
			{ name: '\u200B', value: '\u200B', inline: true }] : []
		)
		.addFields(queueFormatted);

	return embed;
}


client.DisTube
	.on('playSong', async (queue, song) => {
		let playerMessage = client.serversInfo[queue.id].playerMessage;

		if(playerMessage == null){
			playerMessage = await queue.textChannel.send({ embeds: [getPlayerEmbed(queue)] });
			client.serversInfo[queue.id].playerMessage = playerMessage;
			await asyncAddReacts(playerMessage, ['⏯️', '⏭️', '🔁', '🔀', '❌']);

			const collector = playerMessage.createReactionCollector({ filter: (reaction, user) => {
				return !user.bot;
			}, dispose: true });

			async function funcCollector(reaction, user) {
				if(reaction.emoji.name == '⏯️') {
					if(!queue.paused)
						await queue.pause(playerMessage);
					else 
						await queue.resume(playerMessage);
				}
				else if(reaction.emoji.name == '⏭️') {
					if(queue.songs.length > 1)
						await queue.skip();
					else	
						await queue.stop();
				}
				else if(reaction.emoji.name == '🔁') {
					if(queue.repeatMode == 0)
						await queue.setRepeatMode(1);
					else 
						await queue.setRepeatMode(0);
				}
				else if(reaction.emoji.name == '🔀') {
					await queue.shuffle();
				}
				else if(reaction.emoji.name == '❌') {
					await queue.stop();
				}

				if(playerMessage && queue && queue.songs.length > 0)
					playerMessage.edit({ embeds: [getPlayerEmbed(queue)] });
			}

			collector.on('collect', funcCollector).on('remove', funcCollector);
		}
		else
			playerMessage.edit({ embeds: [getPlayerEmbed(queue)] });
			
	})
	.on('addSong', async (queue, song) => {
		if(client.serversInfo[queue.id].playerMessage){
			client.serversInfo[queue.id].playerMessage.edit({ embeds: [getPlayerEmbed(queue)] });
		}
	})
	.on('finish', async (queue, song) => {
		console.log('finish');
	})
	.on('empty', async (queue) => {
		console.log('empty');
	})
	.on('disconnect', async (queue) => {
		if(client.serversInfo[queue.id].playerMessage){
			await client.serversInfo[queue.id].playerMessage.delete();
			client.serversInfo[queue.id].playerMessage = null;
		}

	})
	.on('deleteQueue', async (queue) => {
	})
	.on('initQueue', async (queue) => {

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

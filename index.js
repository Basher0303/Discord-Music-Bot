const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, EmbedBuilder,  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { token, weatherApiKey } = require('./config.json');
const { DisTube } = require("distube");
const deployCommands = require("./deploy-commands");
const { asyncAddReacts } = require('./functions');

//All 
const client = new Client({ 
	intents: 32767
});


client.serversInfo = new Collection();


client.DisTube = new DisTube(client, {
	leaveOnFinish: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
});


function getPlayerPanel(queue) {
	const firstSong = queue.songs[0];
	let queueFormatted = [];
	
	queue.songs.forEach((item, index) => {
		if(index != 0)
		queueFormatted.push({ name: `${index}. ${item.name}`, value: `\`${item.formattedDuration}\``});
	});
	
	const rowFirst = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder().setCustomId('playerStart').setEmoji(queue.paused ? '▶️' : '⏸️').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('playerSkip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary).setDisabled(queue.songs.length < 2),
			new ButtonBuilder().setCustomId('playerShuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary).setDisabled(queue.songs.length < 3),
			new ButtonBuilder().setCustomId('playerClose').setEmoji('✖️').setStyle(ButtonStyle.Danger),
	);	
			
	const rowSecond = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder().setCustomId('playerLoop').setEmoji('🔁').setStyle(queue.repeatMode == 1 ? ButtonStyle.Primary : ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('playerRewind').setEmoji('⏩').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('playerHighVolume').setEmoji('🔊').setStyle(queue.volume == 50 ? ButtonStyle.Secondary : ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('playerAdd').setEmoji('➕').setStyle(ButtonStyle.Success),
	);	

	const embed = new EmbedBuilder()
		.setTitle(firstSong.name)
		.setURL(firstSong.url)
		.setColor(queue.paused ? 0xdb0d63 : 0x0ddb60)
		.setDescription(`\`${firstSong.formattedDuration}\``)
		.setThumbnail(firstSong.thumbnail)
		.addFields(
			queueFormatted.length > 0 ? [{ name: '\u200B', value: '\u200B', inline: true },
			{ name: '\u200B', value: `Очередь (${queue.songs.length - 1})`, inline: true },
			{ name: '\u200B', value: '\u200B', inline: true }] : []
		)
		.addFields(queueFormatted);

	return {embeds: [embed], components: [rowFirst, rowSecond]};
}

client.DisTube
	.on('playSong', async (queue, song) => {
		client.serversInfo.get(queue.id).playerMessage.edit(getPlayerPanel(queue));
	})
	.on('addSong', async (queue, song) => {
		if(client.serversInfo.get(queue.id).playerMessage){
			client.serversInfo.get(queue.id).playerMessage.edit(getPlayerPanel(queue));
		}
	})
	.on('finish', async (queue, song) => {
		console.log('finish');
	})
	.on('empty', async (queue) => {
		console.log('empty');
	})
	.on('disconnect', async (queue) => {
		if(client.serversInfo.get(queue.id).playerMessage){
			await client.serversInfo.get(queue.id).playerMessage.delete();
			client.serversInfo.get(queue.id).playerMessage = null;
		}

	})
	.on('deleteQueue', async (queue) => {
	})
	.on('initQueue', async (queue) => {
		const playerMessage = await queue.textChannel.send(getPlayerPanel(queue));
		client.serversInfo.get(queue.id).playerMessage = playerMessage;

		const collector = playerMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
		collector.on('collect', async (button) => {
			if(playerMessage && queue && queue.songs.length > 0)
				playerMessage.edit(getPlayerPanel(queue));
		});
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


client.buttons = new Collection();
const buttonFolders = fs.readdirSync('./buttons');
for(const folder of buttonFolders) {
	const buttonFiles = fs.readdirSync(`./buttons/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of buttonFiles) {
		const button = require(`./buttons/${folder}/${file}`);
		client.buttons.set(button.data.name, button);
	}
}

client.on('guildCreate', async (guild) => {
	deployCommands(guild.id);
})

client.login(token);

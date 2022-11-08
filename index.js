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

let serversInfo = [];

client.serversInfo = serversInfo;


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
			new ButtonBuilder().setCustomId('playerSkip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('playerLoop').setEmoji('🔁').setStyle(queue.repeatMode == 1 ? ButtonStyle.Primary : ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('playerShuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary).setDisabled(queue.songs.length < 2),
			new ButtonBuilder().setCustomId('playerClose').setEmoji('✖️').setStyle(ButtonStyle.Danger),
	);	

	const rowSecond = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder().setCustomId('playerVolumeDown').setEmoji('🔉').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('playerVolumeUp').setEmoji('🔊').setStyle(ButtonStyle.Secondary),
			//new ButtonBuilder().setCustomId('playerVolumeSet').setEmoji('⏩').setStyle(ButtonStyle.Secondary),
	);	

	const embed = new EmbedBuilder()
		.setTitle(firstSong.name)
		.setURL(firstSong.url)
		.setColor(queue.paused ? 0xdb0d63 : 0x0ddb60)
		.setDescription(`\`${firstSong.formattedDuration}\``)
		.setThumbnail(firstSong.thumbnail)
		.addFields(
			{ name: 'Статус ', value: `\`${queue.paused ? 'Пауза' : 'Играет'}\``, inline: true },
			{ name: 'Повторение', value: `\`${queue.repeatMode == 1 ? 'Включено' : 'Выключено'}\``, inline: true },
			{ name: 'Громкость ', value: `\`${queue.volume}\``, inline: true },
		)
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
		let playerMessage = client.serversInfo[queue.id].playerMessage;	

		if(playerMessage == null){
			playerMessage = await queue.textChannel.send(getPlayerPanel(queue));
			client.serversInfo[queue.id].playerMessage = playerMessage;

			const collector = playerMessage.createMessageComponentCollector({ componentType: ComponentType.Button });

			collector.on('collect', async (button) => {
				if(button.customId == 'playerStart') {
					button.deferUpdate();
					if(!queue.paused)
						await queue.pause(playerMessage);
					else 
						await queue.resume(playerMessage);
				}
				else if(button.customId == 'playerSkip') {
					button.deferUpdate();
					if(queue.songs.length > 1)
						await queue.skip();
					else	
						await queue.stop();
				}
				else if(button.customId == 'playerLoop') {
					button.deferUpdate();
					if(queue.repeatMode == 0)
						await queue.setRepeatMode(1);
					else 
						await queue.setRepeatMode(0);
				}
				else if(button.customId == 'playerShuffle') {
					button.deferUpdate();
					await queue.shuffle();
				}
				else if(button.customId == 'playerVolumeDown') {
					button.deferUpdate();
					if(queue.volume - 10 > 0)
						await queue.setVolume(queue.volume - 10);
				}
				else if(button.customId == 'playerVolumeUp') {
					button.deferUpdate();
					await queue.setVolume(queue.volume + 10);
				}
				else if(button.customId == 'playerClose') {
					button.deferUpdate();
					await queue.stop();
				}
				else if(button.customId == 'playerVolumeSet') {
					const modal = new ModalBuilder()
						.setCustomId('myModal')
						.setTitle('Перемотать песню на определенное время');
			
					const favoriteColorInput = new TextInputBuilder()
						.setCustomId('timecodeInput')
						.setLabel('Укажите тайм-код песни.')
						.setStyle(TextInputStyle.Short)
						.setMaxLength(8)
						.setMinLength(1)
						.setPlaceholder('Например 11:02')
						.setRequired(true);
		
			
					const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
			
					modal.addComponents(firstActionRow);
			
					await button.showModal(modal);	
				}

				if(playerMessage && queue && queue.songs.length > 0)
			 		playerMessage.edit(getPlayerPanel(queue));
			});
		}
		else
			playerMessage.edit(getPlayerPanel(queue));
			
	})
	.on('addSong', async (queue, song) => {
		if(client.serversInfo[queue.id].playerMessage){
			client.serversInfo[queue.id].playerMessage.edit(getPlayerPanel(queue));
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

const fs = require('fs');
const ytdl = require('ytdl-core');

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Добавляет трек в очередь!')
		.addStringOption(option =>
			option.setName('play')
				.setDescription('Вставьте ссылку на видео из YouTube')
				.setMaxLength(1024)
		),
	async execute(interaction) {
		const url = interaction.options.getString('play');
		const songInfo = await ytdl.getBasicInfo('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
		let seconds = songInfo.player_response.videoDetails.lengthSeconds;
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds - hours * 3600) / 60);
		seconds = seconds - hours * 3600 - minutes * 60;

		const titleVideo = songInfo.player_response.videoDetails.title;
		await interaction.reply(
			`Трек добавлен в очередь. 
			Название: ${titleVideo} 
			Длительность: ${hours}:${minutes}:${seconds}`);
	},
};
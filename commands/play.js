const fs = require('fs');
const ytdl = require('ytdl-core');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


const { createAudioPlayer } = require('@discordjs/voice');
const { embedAddedTrack } = require ('../functions');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Добавляет трек в очередь.')
		.addStringOption(option => 
			option.setName('type')
				.setDescription('Выберите источник')
				.setRequired(true)
				.addChoices(
						{name: 'yt', value: 'yt'},
						{name: 'vk', value: 'vk'},
				)
		)
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Вставьте ссылку на трек.')
				.setRequired(true)
				.setMaxLength(1024)
		),

	async execute(interaction) {
		const { options, member, guild, channel, client } = interaction;
		const voiceChannel = member.voice.channel;

		if(!voiceChannel){
			return interaction.reply({
				content: 'Вы должны быть подключены к голосовому каналу, чтобы использовать команды.',
				ephemeral: true,
			})
		}

		// if(guild.me.voice.channelId && voiceChannel.id !== guild.me.voice.channelId){
		// 	return interaction.reply({
		// 		content: `Я уже проигрываю музыку в <#${guild.me.voice.channelId}>.`,
		// 		ephemeral: true,
		// 	})
		// }

		try {
			const query = interaction.options.getString('query');
			const songInfo = await ytdl.getBasicInfo(query);
			
			let seconds = songInfo.player_response.videoDetails.lengthSeconds;
			const hours = Math.floor(seconds / 3600);
			const minutes = Math.floor((seconds - hours * 3600) / 60);
			seconds = seconds - hours * 3600 - minutes * 60;
	
			const videoTitle = songInfo.player_response.videoDetails.title;
			const videoId = songInfo.player_response.videoDetails.videoId;
			const embed = embedAddedTrack(videoTitle, 'https://i.ytimg.com/vi/tLeZStGVaAY/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCTJI6YGxOuls7tUvXuqms7Y8CyGw', '22:28')
			await interaction.reply({
				embeds: [embed]
			});

			client.DisTube.play(voiceChannel, query, {
				member: member,
				textChannel: channel,
			});
		} catch(e) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(`Ошибка: ${e}`);
			return interaction.reply({embeds: [errorEmbed]});
		}
	},
};
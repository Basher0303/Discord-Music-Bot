const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { declOfNum, asyncAddReacts, arrayNumEmoj } = require ('../functions');


function getSongsListPanel(resultSearch, isAddedSongsArr) {
	const formatedTracks = [];
	resultSearch.forEach((item, index) => {
		formatedTracks.push({
			name: `${isAddedSongsArr[index] ? '✅' : '\u200B'} ${index+1}. ${item.name}`,
			value: item.formattedDuration
		});
	});

	const arr = [];
	for (let i = 0; i < resultSearch.length && arrayNumEmoj.length; i++) {
		arr.push(new ButtonBuilder().setCustomId(`songsList_${i+1}`).setEmoji(arrayNumEmoj[i]).setStyle(isAddedSongsArr[i] ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(isAddedSongsArr[i]));
	}
	const rowFirst = new ActionRowBuilder().addComponents(arr);	

	const embed =  new EmbedBuilder()
		.setTitle(`Найдено ${formatedTracks.length} ${declOfNum(formatedTracks.length, ['песня', 'песни', 'песен'])}`)
		.addFields(formatedTracks)
		.setFooter({ text: 'Панель скроется через 15 секунд.'});

	return {embeds: [embed], components: [rowFirst], ephemeral: true};
}


module.exports = {
	data: new SlashCommandBuilder()
	.setName('music')
	.setDescription('Включить музыку')
	.addSubcommand(subcommand => 
		subcommand.setName('play')
			.setDescription('Поиск песни')
			.addStringOption(option => 
				option.setName('query')
					.setDescription('Введите название песни или ссылку на песню.')	
					.setRequired(true)
			)
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
			await interaction.reply({embeds: [
				new EmbedBuilder().setDescription('Немного подождите, Мурад ищет песни 🧐')
			]});

			let query = interaction.options.getString('query').trim();
			const indexSubStr = query.indexOf('youtube.com/watch?');
			let isYouTubeURL = false;

			switch(indexSubStr) {
				case 0: {
					query = 'https://www.' + query;
					isYouTubeURL = true;
					break;
				}
				case 4 : {
					isYouTubeURL = true;
					query = 'https://' + query;
					break;
				}
				case 12 : {
					isYouTubeURL = true;
					break;
				}
				default: 
					break;
			}
			if(isYouTubeURL) {
				interaction.deleteReply();
				client.DisTube.play(voiceChannel, query, {
					member: member,
					textChannel: channel,
				});
				return true;
			}

			const resultSearch = await client.DisTube.search(query, {
				limit: 5,
				safeSearch: true,
			});
			let isAddedSongs = [false, false, false, false, false];

			if(resultSearch.length == 0) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`:disappointed: По вашему запросу ничего не найдено.`)
							.setFooter({ text: 'Попробуйте ввести название песни на другом языке.'})
					],
				});  
			}
			else {		
				const addedMsg = await interaction.editReply(getSongsListPanel(resultSearch, isAddedSongs)); 
				const collector = addedMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

				collector.on('collect', async (button) => {
					button.deferUpdate();
					const numSong = +button.customId.replace('songsList_', '');
					const trackItem = resultSearch[numSong-1];
					isAddedSongs[numSong-1] = true;
					addedMsg.edit(getSongsListPanel(resultSearch, isAddedSongs));

					client.DisTube.play(voiceChannel, trackItem.url, {
						member: member,
						textChannel: channel,
					});
				});
				
				collector.on('end', collected => {
					addedMsg.delete();
				});
			}

		} catch(e) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(`Ошибка: ${e}`);
			return interaction.editReply({embeds: [errorEmbed]});
		}
	},
};
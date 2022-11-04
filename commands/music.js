const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { createAudioPlayer } = require('@discordjs/voice');
const { declOfNum, asyncAddReacts, arrayNumEmoj } = require ('../functions');


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
			const query = interaction.options.getString('query');
			const resultSearch = await client.DisTube.search(query, {
				limit: 5,
			});
			//console.log(resultSearch);

			if(resultSearch.length == 0) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`:disappointed: По вашему запросу ничего не найдено.`)
							.setFooter({ text: 'Попробуйте ввести название песни на другом языке.'})
					],
				});  
			}
			else {
				const formatedTracks = [];
				resultSearch.forEach((item, index) => {
					formatedTracks.push({
						name: `${index+1}. ${item.name}`,
						value: item.formattedDuration
					});
				});

				const embed = new EmbedBuilder()
					.setTitle(`Найдено ${formatedTracks.length} ${declOfNum(formatedTracks.length, ['песня', 'песни', 'песен'])}`)
					.addFields(formatedTracks)
					.setFooter({ text: 'Нажмите на цифру в реакции.'});
				const addedMsg = await interaction.reply({
					embeds: [embed],
					fetchReply: true
				}); 		
				
				await asyncAddReacts(addedMsg, arrayNumEmoj.slice(0, resultSearch.length));

				const collector = addedMsg.createReactionCollector({ filter: (reaction, user) => {
					return !user.bot;
				}, max: 1 , time: 15000});

				collector.on('collect', async (reaction, user) => {
					const trackItem = resultSearch[arrayNumEmoj.findIndex(item => item == reaction.emoji.name)];
					const trackName = trackItem.name;

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
			return interaction.reply({embeds: [errorEmbed]});
		}
	},
};
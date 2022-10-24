const fs = require('fs');
const ytdl = require('ytdl-core');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


const { createAudioPlayer } = require('@discordjs/voice');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('find')
		.setDescription('Найти трек.')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Напишите название трека.')
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

		try {
			const query = interaction.options.getString('query');
            const searchResult = await client.DisTube.search(query, {});

            if(searchResult){
				const arrayNumEmoj = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
				let arrayRows = [];
				searchResult.forEach((element,index) => {
					arrayRows.push({name: `${arrayNumEmoj[index]} ${element.name}`, value: `    ${element.formattedDuration}`});
				});

                const embed = new EmbedBuilder()
                    .addFields(arrayRows);
                const addedMsg = await interaction.reply({
                    embeds: [embed],
                    fetchReply: true
                });
				
				async function asyncСycle(array) {
					for (const item of array) {
					  await addedMsg.react(`${item}`);
					}
				}
				await asyncСycle(arrayNumEmoj);

				
				const collector = addedMsg.createReactionCollector({ filter: (reaction, user) => {
					return !user.bot;
				}, max: 1 });
				
				collector.on('collect', async (reaction, user) => {

					const songItem = searchResult[arrayNumEmoj.findIndex(item => item == reaction.emoji.name)];
					addedMsg.delete();

					const embed = new EmbedBuilder()
						.setAuthor({ name: `Трек добавлен в очередь!`})
						.setTitle(songItem.name)
						.setThumbnail(songItem.thumbnail)
						.addFields(
							{ name: 'Длительность: ', value: songItem.formattedDuration, inline: true },
					);
					channel.send({
						embeds: [embed]
					});

					client.DisTube.play(voiceChannel, query, {
						member: member,
						textChannel: channel,
					});
				
				});
				
				collector.on('end', collected => {
					console.log(`Collected ${collected.size} items`);
				});

            }
            else
                interaction.reply('Треки не найдены');

		} catch(e) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(`Ошибка: ${e}`);
			return interaction.reply({embeds: [errorEmbed]});
		}
	},
};
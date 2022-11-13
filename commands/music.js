const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchSongs } = require('../functions');

module.exports = {
	data: new SlashCommandBuilder()
			.setName('music')
			.setDescription('Поиск песни')
			.addStringOption(option => 
				option.setName('query')
					.setDescription('Введите название песни или ссылку на песню.')	
					.setRequired(true)
	),
	options: {
		inOneVoiceChannel: true,
	},
	async execute(interaction) {
		await interaction.reply({embeds: [
			new EmbedBuilder().setDescription('Немного подождите, Мурад ищет песни 🧐')
		]});
		await searchSongs(interaction, interaction.options.getString('query').trim());
		interaction.deleteReply();
	},
};
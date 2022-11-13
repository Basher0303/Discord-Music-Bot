const {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

module.exports = {
    data: {
        name: 'playerRewind',
    },
    options: {
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        const modal = new ModalBuilder()
            .setCustomId('playerRewindModal')
            .setTitle('Перемотать песню');

        const input = new TextInputBuilder()
            .setCustomId('playerRewindInput')
            .setLabel(`Укажите тайм-код песни в формате ${queue.songs[0].formattedDuration.replace(/[0-9]/g, '0')}`)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(queue.songs[0].formattedDuration.length)
            .setMinLength(1)
            .setPlaceholder(`Сейчас ${queue.formattedCurrentTime}`)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);
        await interaction.showModal(modal);	
    }
}
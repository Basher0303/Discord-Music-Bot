const {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');


module.exports = {
    data: {
        name: 'playerRewind',
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const modal = new ModalBuilder()
            .setCustomId('playerRewindModal')
            .setTitle('Перемотать песню на определенное время');

        const input = new TextInputBuilder()
            .setCustomId('playerRewindInput')
            .setLabel('Укажите тайм-код песни.')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(8)
            .setMinLength(1)
            .setPlaceholder('Например 11:02')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);
        await interaction.showModal(modal);	
    }
}
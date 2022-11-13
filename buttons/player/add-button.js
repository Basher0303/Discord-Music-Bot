const {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

module.exports = {
    data: {
        name: 'playerAdd',
    },
    options: {
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const modal = new ModalBuilder()
            .setCustomId('playerAddModal')
            .setTitle('Добавить песню в очередь');

        const input = new TextInputBuilder()
            .setCustomId('playerAddInput')
            .setLabel('Введите название песни или ссылку на песню')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setMinLength(1)
            .setPlaceholder('Название песни')
            .setRequired(true);


        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);
        await interaction.showModal(modal);	
    }
}
const { searchSongs } = require ('../../functions');

module.exports = {
    data: {
        name: 'playerAddModal',
    },
    async execute (interaction) {
        const inputVal = interaction.fields.getTextInputValue('playerAddInput').trim();
        await interaction.deferUpdate();
        searchSongs(interaction, inputVal);
    }
}
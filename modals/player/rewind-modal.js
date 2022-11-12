const moment = require("moment");
moment.locale('ru');

module.exports = {
    data: {
        name: 'playerRewindModal',
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        const inputVal = interaction.fields.getTextInputValue('playerRewindInput');
        const hasHours = inputVal.length == 8;
        const reg = hasHours ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/ : /^[0-5][0-9]:[0-5][0-9]$/;

        if(reg.test(inputVal)) {
            const durInSeconds = moment(inputVal, `${hasHours ? 'HH:' : ''}mm:ss:`).diff(moment().startOf('day'), 'seconds');
            if(durInSeconds < queue.songs[0].duration) {
                queue.seek(durInSeconds);
                await interaction.deferUpdate();
            }
        }
    }
}
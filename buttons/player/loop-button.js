module.exports = {
    data: {
        name: 'playerLoop',
    },
    options: {
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        interaction.deferUpdate();
		if(queue.repeatMode == 0)
            await queue.setRepeatMode(1);
        else 
            await queue.setRepeatMode(0);
    }
}
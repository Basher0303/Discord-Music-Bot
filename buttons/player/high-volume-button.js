module.exports = {
    data: {
        name: 'playerHighVolume',
    },
    options: {
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        interaction.deferUpdate();
		if(queue.volume == 50)
            await queue.setVolume(300);
        else
            await queue.setVolume(50);
    }
}
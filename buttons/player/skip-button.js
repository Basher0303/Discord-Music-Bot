module.exports = {
    data: {
        name: 'playerSkip',
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        interaction.deferUpdate();
		if(queue.songs.length > 1)
			await queue.skip();
		else	
			await queue.stop();
    }
}
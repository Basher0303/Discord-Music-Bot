module.exports = {
    data: {
        name: 'playerStart',
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        interaction.deferUpdate();
		if(!queue.paused)
			await queue.pause(client.serversInfo.get(quiildId).playerMessage);
		else 
			await queue.resume(client.serversInfo.get(quiildId).playerMessage);
    }
}
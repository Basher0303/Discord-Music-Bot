module.exports = {
    data: {
        name: 'playerClose',
    },
    options: {
        inOneVoiceChannel: true,
    },
    async execute (interaction) {
        const client = interaction.client;
        const quiildId = interaction.member.guild.id;
        const queue = client.DisTube.queues.collection.get(quiildId);

        interaction.deferUpdate();
		await queue.stop();
    }
}
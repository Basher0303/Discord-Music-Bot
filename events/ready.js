const deployCommands = require("../deploy-commands");

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Welcome, ${client.user.username}`);
		client.guilds.cache.forEach(server => {
			deployCommands(server.id);
			client.serversInfo.set(server.id, {
				playerMessage: null,
			});
		});


		client.user.setActivity('погоду | /weather', { type: 2 });
	},
};
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Welcome, ${client.user.username}`);
	},
};
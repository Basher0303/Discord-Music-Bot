module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
        if (interaction.isChatInputCommand()){
            const command = interaction.client.commands.get(interaction.commandName);
            const voiceChannel = interaction.member.voice.channel;

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
        
            try {
                if(command.options.inOneVoiceChannel && !voiceChannel){
                    await interaction.reply({
                        content: 'Мурад слушает только тех, кто в голосовом канале.',
                        ephemeral: true,
                    });
                    return;
                }
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: 'Ты сделал Мураду больно. Я не знаю как у тебя это удалось, но постарайся больше так не делать.', 
                    ephemeral: true 
                });
            }
        } else if(interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId);
            const voiceChannel = interaction.member.voice.channel;

            if(!button) {
                console.error(`Кнопка "${interaction.customId}" не найдена`);
                return;
            }

            try{
                if(button.options.inOneVoiceChannel && (!voiceChannel || !voiceChannel.members.find(guildMember => guildMember.user == interaction.client.user))){
                    await interaction.reply({
                        content: 'Мурад слушает только тех, кто с ним в одном голосовом канале.',
                        ephemeral: true,
                    });
                    return;
                }
                await button.execute(interaction);
            } catch(error) {
                console.log(error);
                await interaction.reply({
                    content: 'Ты сделал Мураду больно. Я не знаю как у тебя это удалось, но постарайся больше так не делать.',
                    ephemeral: true
                });
            }
        } else if (interaction.isModalSubmit()) {
            const modal = interaction.client.modals.get(interaction.customId);

            if(!modal) {
                console.error(`Модальное окно ${interaction.customId} не найдено`);
                return;
            }

            try {
                await modal.execute(interaction);
            } catch(error) {
                console.log(error);
                await interaction.reply({
                    content: 'Ты сделал Мураду больно. Я не знаю как у тебя это удалось, но постарайся больше так не делать.',
                    ephemeral: true
                });
            }
        }
	},
};
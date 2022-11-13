//1, 4, 5
function declOfNum(n, text_forms) {  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

function toFirstLetterUpper(word) {
	let result = word.split('');
	result[0] = result[0].toUpperCase();
	return result.join('');
}

async function asyncAddReacts(message, array) {
    for (const item of array) {
      await message.react(`${item}`);
    }
}

async function searchSongs(interaction, query) {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

    const { member, channel, client} = interaction;
    const voiceChannel = member.voice.channel;

    try {
        const indexSubStr = query.indexOf('youtube.com/watch?');
        let isYouTubeURL = false;

        switch(indexSubStr) {
            case 0: {
                query = 'https://www.' + query;
                isYouTubeURL = true;
                break;
            }
            case 4 : {
                isYouTubeURL = true;
                query = 'https://' + query;
                break;
            }
            case 12 : {
                isYouTubeURL = true;
                break;
            }
            default: 
                break;
        }

        const resultSearch = await client.DisTube.search(query, {
            limit: isYouTubeURL ? 1 : 5,
            safeSearch: true,
        });

        if(resultSearch.length == 0) {
            const erroeMsg = await interaction.channel.send({
                embeds: [new EmbedBuilder().setDescription(`<@${member.user.id}> Мурад ничего не смог найти 😕`)]
            });
            setTimeout(async () => {
                await erroeMsg.delete();
            }, 4000);            
        } else if(resultSearch.length == 1) {
            client.DisTube.play(voiceChannel, query, {
                member: member,
                textChannel: channel,
            });
        } else {
            let isAddedSongs = [false, false, false, false, false];
            const addedMsg = await interaction.channel.send(getSongsListPanel(resultSearch, isAddedSongs)); 
            const collector = addedMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

            collector.on('collect', async (button) => {
                button.deferUpdate();
                const numSong = +button.customId.replace('songsList_', '');
                const trackItem = resultSearch[numSong-1];
                isAddedSongs[numSong-1] = true;
                addedMsg.edit(getSongsListPanel(resultSearch, isAddedSongs));

                client.DisTube.play(voiceChannel, trackItem.url, {
                    member: member,
                    textChannel: channel,
                });
            });
            
            collector.on('end', collected => {
                addedMsg.delete();
            });
        }

    } catch(e) {
        const erroeMsg = await interaction.channel.send({
            embeds: [new EmbedBuilder().setDescription(`<@${member.user.id}> ${e} 😕`)]
        });
        setTimeout(async () => {
            await erroeMsg.delete();
        }, 4000);
    }  

    function getSongsListPanel(resultSearch, isAddedSongsArr) {
        const formatedTracks = [];
        resultSearch.forEach((item, index) => {
            formatedTracks.push({
                name: `${isAddedSongsArr[index] ? '✅' : '\u200B'} ${index+1}. ${item.name}`,
                value: item.formattedDuration
            });
        });
    
        const arr = [];
        for (let i = 0; i < resultSearch.length && arrayNumEmoj.length; i++) {
            arr.push(new ButtonBuilder().setCustomId(`songsList_${i+1}`).setEmoji(arrayNumEmoj[i]).setStyle(isAddedSongsArr[i] ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(isAddedSongsArr[i]));
        }
        const rowFirst = new ActionRowBuilder().addComponents(arr);	
    
        const embed =  new EmbedBuilder()
            .setTitle(`Найдено ${formatedTracks.length} ${declOfNum(formatedTracks.length, ['песня', 'песни', 'песен'])}`)
            .addFields(formatedTracks)
            .setFooter({ text: 'Панель скроется через 15 секунд.'});
    
        return {embeds: [embed], components: [rowFirst], ephemeral: true};
    }
}

const arrayNumEmoj = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];



module.exports = {
    declOfNum,
    asyncAddReacts,
    searchSongs,
    toFirstLetterUpper,
    arrayNumEmoj
};
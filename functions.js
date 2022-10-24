
function embedAddedTrack(title, thumbnail, duration){
    return new EmbedBuilder()
        .setAuthor({ name: `Трек добавлен в очередь!`})
        .setTitle(title)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Длительность: ', value: duration, inline: true },
    );
} 

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

const arrayNumEmoj = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];


module.exports = {
    embedAddedTrack,
    declOfNum,
    asyncAddReacts,
    toFirstLetterUpper,
    arrayNumEmoj
};
module.export = function embedAddedTrack(title, thumbnail, duration){
    return new EmbedBuilder()
        .setAuthor({ name: `Трек добавлен в очередь!`})
        .setTitle(title)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Длительность: ', value: duration, inline: true },
    );
} 
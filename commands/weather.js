const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { weatherApiKey } = require('../config.json');


const arrayEmojies = {
	200: ':thunder_cloud_rain:', 201: ':thunder_cloud_rain:', 202: ':thunder_cloud_rain:', 210: ':thunder_cloud_rain:', 211: ':thunder_cloud_rain:', 212: ':thunder_cloud_rain:', 221: ':thunder_cloud_rain:', 230: ':thunder_cloud_rain:', 231: ':thunder_cloud_rain:', 232: ':thunder_cloud_rain:',
	300: ':white_sun_rain_cloud:', 301: ':white_sun_rain_cloud:', 302: ':white_sun_rain_cloud:', 310: ':white_sun_rain_cloud:', 311: ':white_sun_rain_cloud:', 312: ':white_sun_rain_cloud:', 313: ':white_sun_rain_cloud:', 314: ':white_sun_rain_cloud:', 321: ':white_sun_rain_cloud:',
	500: ':white_sun_rain_cloud:', 501: ':white_sun_rain_cloud:', 502: ':white_sun_rain_cloud:', 503: ':white_sun_rain_cloud:', 504: ':white_sun_rain_cloud:', 511: ':white_sun_rain_cloud:', 520: ':cloud_rain:', 521: ':cloud_rain:', 522: ':cloud_rain:', 531: ':cloud_rain:',
	600: ':cloud_snow:', 601: ':cloud_snow:', 602: ':cloud_snow:', 611: ':cloud_snow:', 612: ':cloud_snow:', 613: ':cloud_snow:', 615: ':cloud_snow:', 616: ':cloud_snow:', 620: ':cloud_snow:', 621: ':cloud_snow:', 622: ':cloud_snow:',
	700: ':fog:', 701: ':fog:', 711: ':fog:', 721: ':fog:', 731: ':fog:', 741: ':fog:', 751: ':fog:', 761: ':fog:', 762: ':fog:', 771: ':fog:', 781: ':fog:',
	800: ':sunny:', 801: ':white_sun_small_cloud:', 802: ':partly_sunny:', 803: ':white_sun_cloud:', 804: ':cloud: ',
};

const arrayCities = {
	'gagino' : {name: 'Гагино', id: 562209, urlImage: 'https://files.pravda-nn.ru/2019/12/gagino.jpg'},
	'nn' : {name: 'Нижний Новгород', id: 520555, urlImage: 'https://aboutnizhnynovgorod.ru/imags/nizhniy_novgorod.jpg'},
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Показать погоду')
		.addStringOption(option => 
			option.setName('city')
				.setDescription('Выберите город')
				.setRequired(true)
				.addChoices(
						{name: 'Гагино', value: 'gagino'},
						{name: 'Нижний Новгород', value: 'nn'},
				)
		),

	async execute(interaction) {
		const { options, member, guild, channel, client } = interaction;

		function degToDir(deg) {
			//deg = deg < 180 ? deg : deg - 360;
			
			if(deg < 15 || deg > 345) return 'З';
			if(15 < deg < 75 ) return 'ЮЗ';
			if(75 < deg < 105 ) return 'Ю';
			if(105 < deg < 165 ) return 'ЮВ';
			if(165 < deg < 195 ) return 'В';
			if(195 < deg < 255 ) return 'СВ';
			if(255 < deg < 285 ) return 'С';
			if(285 < deg < 345 ) return 'СЗ';
		}

		function formattedDate(unixtime) {
			let date = new Date(unixtime * 1000);
			let hours = date.getHours();
			let minutes = date.getMinutes();		
			return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`	
		}

		try {
			const city = interaction.options.getString('city');
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${arrayCities[city].id}&units=metric&lang=ru&appid=${weatherApiKey}`);
            const data = await res.json();//assuming data is json

			let description = data.weather[0].description.split('');
			description[0] = description[0].toUpperCase();
			description = description.join('');

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`**Погода в городе ${arrayCities[city].name}**`)
                .setThumbnail(arrayCities[city].urlImage)
				.addFields(
					{ name: `${arrayEmojies[data.weather[0].id] ?? arrayEmojies[Math.floor(data.weather[0].id / 100) * 100]} ${description}`, value: '\u200B'},
				)
                .addFields(
                    { name: ':thermometer: Температура:', value: `${data.main.temp.toFixed(1)} ℃`, inline: true },
					{ name: ':dash: Скорость ветра:', value: `${data.wind.speed.toFixed(1)}м/с (${degToDir(data.wind.speed.deg)})`, inline: true },
					{ name: ':sun_with_face: Время восхода:', value: `${formattedDate(data.sys.sunrise)}`, inline: true },
					)
				.addFields(
					{ name: ':thermometer_face: Ощущается как:', value: `${data.main.feels_like.toFixed(1)} ℃`, inline: true },
					{ name: ':cloud: Облачность:', value: `${data.clouds.all}%`, inline: true },
					{ name: ':new_moon_with_face: Время заката:', value: `${formattedDate(data.sys.sunset)}`, inline: true },
				);
         
			await interaction.reply({embeds: [embed]});          

		} catch(e) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(`Ошибка: ${e}`);
			return interaction.reply({embeds: [errorEmbed]});
		}
	},
};
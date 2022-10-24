const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const fetch = require('node-fetch');
const { weatherApiKey } = require('../config.json');
const { declOfNum, arrayNumEmoj, asyncAddReacts, toFirstLetterUpper } = require ('../functions');
moment.locale('ru');


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

function degToDir(deg) {
	if(deg < 15 || deg > 345) return 'З';
	if(15 < deg < 75 ) return 'ЮЗ';
	if(75 < deg < 105 ) return 'Ю';
	if(105 < deg < 165 ) return 'ЮВ';
	if(165 < deg < 195 ) return 'В';
	if(195 < deg < 255 ) return 'СВ';
	if(255 < deg < 285 ) return 'С';
	if(285 < deg < 345 ) return 'СЗ';
}

function getMinAndMaxTemp(data) {
	let result = [];
	
	let curDay, pastDay, minTemp, maxTemp;
	for (let i = 0; i < data.length; i++) {
		let item = data[i];

		pastDay = curDay;
		curDay = moment(item.dt * 1000).format('D');
		
		if(curDay == pastDay) {
			if(item.main.temp < minTemp)
				minTemp = item.main.temp;
			if(item.main.temp > maxTemp)
				maxTemp = item.main.temp;
		}
		else {
			if(i != 0)
				result.push({ numDay: pastDay, min: minTemp, max: maxTemp});

			minTemp = item.main.temp;
			maxTemp = item.main.temp;
		}	
	}
	result.push({ numDay: curDay, min: minTemp, max: maxTemp});

	return result;
}

function getForecastEmbed(data) {
	let currData = data.list[0];
	let temperatureData = getMinAndMaxTemp(data.list).slice(1, -1);

	let formattedData = [];
	for (let j = 7, i = 0; j < data.list.length && i < 4; j += 8, i += 1) {
		let item = data.list[j];
		let itemDate = moment(item.dt * 1000);
		
		formattedData.push({ name: itemDate.format('D MMMM'), value: toFirstLetterUpper(itemDate.format('dddd')), inline: true});
		formattedData.push({ name: `${temperatureData[i].max.toFixed(1)} ℃ Макс.`, value: `${temperatureData[i].min.toFixed(1)} ℃ Мин.`, inline: true});
		formattedData.push({ name: `${arrayEmojies[item.weather[0].id]} ${toFirstLetterUpper(item.weather[0].description)}`, value: '\u200B', inline: true});
	}

	return new EmbedBuilder()
		.setTitle(`**Погода в городе ${data.city.name}**`)
		.addFields(
			{ name: `${arrayEmojies[currData.weather[0].id] ?? arrayEmojies[Math.floor(currData.weather[0].id / 100) * 100]} ${toFirstLetterUpper(currData.weather[0].description)}`, value: '\u200B'},
		)
		.addFields(
			{ name: ':thermometer: Температура:', value: `${currData.main.temp.toFixed(1)} ℃`, inline: true },
			{ name: ':dash: Скорость ветра:', value: `${currData.wind.speed.toFixed(1)}м/с (${degToDir(currData.wind.speed.deg)})`, inline: true },
			{ name: ':sun_with_face: Время восхода:', value: moment(data.city.sunrise * 1000).format('H:mm'), inline: true },
			)
		.addFields(
			{ name: ':thermometer_face: Ощущается как:', value: `${currData.main.feels_like.toFixed(1)} ℃`, inline: true },
			{ name: ':cloud: Облачность:', value: `${currData.clouds.all}%`, inline: true },
			{ name: ':new_moon_with_face: Время заката:', value: moment(data.city.sunset * 1000).format('H:mm'), inline: true },
		)
		.addFields(
			{ name: '\u200B', value: '\u200B', inline: true },
			{ name: '\u200B', value: 'Прогноз на 4 дня', inline: true },
			{ name: '\u200B', value: '\u200B', inline: true },
		)
		.addFields(formattedData);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Показать погоду')
		.addSubcommand(subcommand =>
			subcommand.setName('home')
				.setDescription('Погода дома')
				.addStringOption(option => 
					option.setName('city')
						.setDescription('Выберите город')
						.setRequired(true)
						.addChoices(
							{name: 'Гагино', value: 'gagino'},
							{name: 'Нижний Новгород', value: 'nn'},
						)
				)
		)
		.addSubcommand(subcommand => 
			subcommand.setName('find')
				.setDescription('Поиск города')
				.addStringOption(option => 
					option.setName('city')
						.setDescription('Введите название города')	
						.setRequired(true)
				)
		),

	async execute(interaction) {
		const { options, member, guild, channel, client} = interaction;
		const subCommand = interaction.options.getSubcommand();

		try {
			if(subCommand == 'home'){
				const city = interaction.options.getString('city');
				const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${arrayCities[city].id}&units=metric&lang=ru&appid=${weatherApiKey}`);
				const data = await res.json();
					 
				await interaction.reply({embeds: [getForecastEmbed(data)]});          
			}
			else if(subCommand == 'find') {
				const city = interaction.options.getString('city');
				const resCities = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=10&appid=${weatherApiKey}`);
				const dataCities = await resCities.json();

				const formatedCities = [];
				dataCities.forEach((item, index) => {
					formatedCities.push({
						name: `${index+1}. ${(item.local_names && item.local_names.ru) ? item.local_names.ru : item.name}`,
						value: item.state ?? item.country
					});
				});

				const embed = new EmbedBuilder()
					.setTitle(`Найдено ${dataCities.length} ${declOfNum(dataCities.length, ['город', 'города', 'городов'])}`)
					.addFields(formatedCities)
					.setFooter({ text: 'Нажмите на цифру в реакции.'});
				const addedMsg = await interaction.reply({
					embeds: [embed],
					fetchReply: true
				});  

				await asyncAddReacts(addedMsg, arrayNumEmoj.slice(0, dataCities.length));

				const collector = addedMsg.createReactionCollector({ filter: (reaction, user) => {
					return !user.bot;
				}, max: 1 , time: 15000});

				collector.on('collect', async (reaction, user) => {
					const cityItem = dataCities[arrayNumEmoj.findIndex(item => item == reaction.emoji.name)];
					const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityItem.lat}&lon=${cityItem.lon}&units=metric&lang=ru&appid=${weatherApiKey}`);
					const dataForecast = await resForecast.json();
					console.log(dataForecast);

					dataForecast.city.name = (cityItem.local_names && cityItem.local_names.ru) ? cityItem.local_names.ru : cityItem.name;

					await channel.send({embeds: [getForecastEmbed(dataForecast)]});  
				});
				
				collector.on('end', collected => {
					addedMsg.delete();
				});
			}
		} catch(e) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(`Ошибка: ${e}`);
			return interaction.reply({embeds: [errorEmbed]});
		}
	},
};
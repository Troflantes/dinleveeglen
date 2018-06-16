const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix;

module.exports = client => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Bot Dosyalari Yukleniyor`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Bot Dosyalari Yuklendi.`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Dinle ve Eglen : İhsan Baki Doğan gururla sunar.`);
  client.user.setStatus("online");
  client.user.setGame(`${prefix}yardım | YENİ NESİL BOT | İBD`);
  console.log(`Hazir Sunucuyu Baslatin...`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Dinle ve Eglen Calisiyor.`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Yapımcım ihsan Hazırladı ! `);
				  
				  
};

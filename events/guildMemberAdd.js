const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix;

module.exports = member => {
    let username = member.user.username;
    member.sendMessage('Hoş geldin **' + username + '**Dinle ve Eglen Botu Destek Ekibine Katilmak Icin Dinle ve Eglen Resmi Sunucumuza Gelebilirsin.https://discord.gg/V5kb9AM');
};

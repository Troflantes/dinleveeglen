const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('../ayarlar.json');

exports.run = (client, message) => {
  const embed = new Discord.RichEmbed()
  .setTitle("Davet Edip Bana Yardımcı Olmak İçin Bana Tıklayabilirsin :)")
  .setAuthor("Dinle Ve Eğlen", "https://cdn.discordapp.com/avatars/456758614997336064/9de400f825a4c389e4f4a3d7dc370d99.png?size=2048")
  /*
   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
   */
  .setColor("RANDOM")
  .setDescription("Dinle Ve Eğlen botu sunucunuza ekleyip Dinle Ve Eğlen'ni Yardım Etmiş Olursunuz Ve Eğlenceli Komutlara Sahip Olursunuz.")
  .setFooter("Dinle Ve Eğlen", "https://cdn.discordapp.com/avatars/456758614997336064/9de400f825a4c389e4f4a3d7dc370d99.png?size=2048")
  .setThumbnail("https://cdn.discordapp.com/avatars/456758614997336064/9de400f825a4c389e4f4a3d7dc370d99.png?size=2048")
  /*
   * Takes a Date object, defaults to current date.
   */
  .setTimestamp()
  .setURL('https://discordapp.com/oauth2/authorize?client_id=446379688839872532&scope=bot&permissions=2146958591')
  
  message.channel.send({embed});
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'davet',
  description: 'Bot ile ilgili bilgi verir.',
  usage: 'davet'
};

const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const yt = require('ytdl-core');
const sql = require('sqlite');
sql.open('./score.sqlite');
require('./util/eventLoader')(client);
const prefix = 'dve!';
const allowedUsers = ayarlar.allowedUsers;
const roles = ayarlar.roleToDisco;
const disco = new Discord.Client();


client.on('guildMemberAdd', member => {
  const hg = new Discord.RichEmbed()
  .setAuthor(client.user.username, client.user.avatarURL)
  .setThumbnail(member.user.displayAvatarURL)
  .setDescription(`** ${member.guild.name} Sunucusuna Hoşgeldin ${member.user.username}**`)
  .setFooter(`© Dinle Ve Eğlen`)
  .setTimestamp()
  .setColor('RANDOM')
  member.send(hg);
});

client.on('guildMemberRemove', member => {
  const bb = new Discord.RichEmbed()
  .setAuthor(client.user.username, client.user.avatarURL)
  .setThumbnail(member.user.displayAvatarURL)
  .setDescription(`** Görüşmek Üzere ${member.user.username} :wave:**`)
  .setFooter(`© Dinle Ve Eğlen`)
  .setTimestamp()
  .setColor('RANDOM')
  member.send(bb);
});

///////////////////////BOT HG - BB////////////////////////////

//////////////////////////////////////////////////////////////

// reklam yasaklayan
 client.on("message", msg => {
  if (msg.content.toLowerCase().match(/(http|.com|discord.gg|discordapp.com)/g) && !msg.author.bot && msg.channel.type === "text" && msg.channel.permissionsFor(msg.guild.member(client.user)).has("ADMINISTRATOR")) {
   msg.delete(30).then(deletedMsg => {
       deletedMsg.reply("Reklam Yapma ! :shield:").catch(e => {
         console.error(e);
       });
     }).catch(e => {
       console.error(e);
     });
   }
});

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;

  let command = message.content.split(' ')[0];
  command = command.slice(ayarlar.prefix.length);

  let args = message.content.split(' ').slice(1);

  if(command === "translate") {
    var translate = require('node-google-translate-skidz');
    let targetLang = args[0];
    if(!targetLang) return message.channel.send(":no_entry_sign: Dogru Kullanim **dve!translate tr merhaba**");
    if(targetLang.length > 2) return message.channel.send(":no_entry_sign: Lütfen bir dil gir **tr, en** Mesela.");
    var translateText = args.slice(1).join(" ");
    if(!translateText) return message.channel.send(`:no_entry_sign: Çevirmek istediğiniz "${targetLang}" dili yazın..`);

    translate({
      text: translateText,
      target: targetLang
    }, function(result) {
      var translatedText = result.translation
      const embed = new Discord.RichEmbed()
      .setAuthor(`Çeviri`, message.author.avatarURL)
      .setColor(0x00AE86)
      .addField("Mesaj:", "**" + translateText + "**")
      .addField(`Çevrilen Mesaj: ${targetLang}`, "**" + translatedText + "**")
      .setFooter(`${message.author.tag} tarafından istendi!`, client.user.avatarURL)
      message.channel.send({embed})
        .catch(error => message.channel.send(`Üzgünüm ${message.author.tag} Sana embed şeklinde yollayamıyorum: ${error}`))
    });
  }
})

client.on('guildCreate', guild => {
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Sunucuya katıldı;')
  .setDescription(`Bot, 》${guild.name}《 adlı sunucuya katıldı [${guild.memberCount} üye]!`)
  .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
  .setTimestamp()
  client.channels.get('445989714294734862').send(embed);
});

client.on('guildDelete', guild => {
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Sunucudan ayrıldı;')
  .setDescription(`Bot, 》${guild.name}《 adlı sunucudan ayrıldı [${guild.memberCount} üye]!`)
  .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
  .setTimestamp()
  client.channels.get('445989714294734862').send(embed);
});

client.on('roleCreate', role => {
  const channel = role.guild.channels.find('name', 'log');
  if (!channel) return role.guild.createChannel('log');
  if (!channel) return;
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Rol oluşturuldu;')
  .setDescription(`"<@&${role.id}>" adlı rol oluşturuldu!`)
  .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
  .setTimestamp()
  channel.send(embed);
});

client.on('roleDelete', role => {
  const channel = role.guild.channels.find('name', 'log');
  if (!channel) return role.guild.createChannel('log');
  if (!channel) return;
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Rol silindi;')
  .setDescription(`"${role.name}" adlı rol silindi!`)
  .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
  .setTimestamp()
  channel.send(embed);
});

client.on('channelDelete', chnnl => {
  const channel = chnnl.guild.channels.find('name', 'log');
  if (!channel) return;
  const embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setTitle('Kanal silindi;')
  .setDescription(`"${chnnl.name}" adlı kanal silindi!`)
  .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
  .setTimestamp()
  channel.send(embed);
});

client.on('guildMemberAdd', member => {
  member.addRole(member.guild.roles.find(r => r.name.startsWith('Üye')));
  const channel = member.guild.channels.find('name', 'giden-gelen');
  if (!channel) return;
 const embed = new Discord.RichEmbed()
 .setColor('RANDOM')
 .setAuthor(member.user.tag, member.user.avatarURL || member.user.defaultAvatarURL)
 .setThumbnail(member.user.avatarURL || member.user.defaultAvatarURL)
 .setTitle('Üye katıldı;')
 .setDescription(`Sunucuya katıldı [${member.guild.memberCount} üye]!`)
 .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
 .setTimestamp()
 channel.send(embed);
});

client.on('guildMemberRemove', member => {
  const channel = member.guild.channels.find('name', 'giden-gelen');
  if (!channel) return;
 const embed = new Discord.RichEmbed()
 .setColor('RANDOM')
 .setAuthor(member.user.tag, member.user.avatarURL || member.user.defaultAvatarURL)
 .setThumbnail(member.user.avatarURL || member.user.defaultAvatarURL)
 .setTitle('Üye ayrıldı;')
 .setDescription(`Sunucudan ayrıldı [${member.guild.memberCount} üye]!`)
 .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
 .setTimestamp()
 channel.send(embed);
});	

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
    setTimeout(() => {
	msg.react('🇦');
	},500);
	setTimeout(() => {
	msg.react('🇸');
	},1000);
  };

  if (msg.author.bot) return;
  if (msg.content.toLowerCase().includes('herkese günaydın')) msg.reply('**GÜNAYDIN Güzel Kardeşim Bak Ne Güzel Yaşıyorsun Şükür Et ** :)');
  if (msg.content.toLowerCase().includes('iyi geceler')) msg.reply('**SAHİDEN İYİ Mİ GECELER ?**');
  if (msg.content.toLowerCase().includes('iyi akşamlar')) msg.reply('**EYV. İYİ AKŞAMLAR**');
  if (msg.content.toLowerCase().includes('selamın aleyküm')) msg.reply('**ALEYKÜM SELAM HOŞGELDİN YİĞİDO**');
  if (msg.content.toLowerCase().includes('güle güle')) msg.reply('**GÜLE GÜLE CİĞERİM**');
  if (msg.content.toLowerCase().includes('canım sıkkın')) msg.reply('** :smoking: Hayırdır Be Moruk Kim Sıktı Canını Biz Burdayız Anlat**');
});

client.on('message', msg => {
if (msg.content.toLowerCase() === 'dve!sigara') {
msg.channel.send(':smoking: :cloud::cloud::cloud:')
.then(nmsg => nmsg.edit(':smoking: :cloud::cloud:'))
.then(nmsg => nmsg.edit(':smoking: :cloud:'))
.then(nmsg => nmsg.edit(':smoking: :cloud::cloud:'))
.then(nmsg => nmsg.edit(':smoking: :cloud:'))
.then(nmsg => nmsg.edit('**Sigaram bitti** | **Sigara İçmeyiniz.** :no_smoking: **Sigara Sağlığa Zararlıdır**'));
}
});


client.on('message', message => {
  if (message.author.bot) return;
  if (message.channel.type !== 'text') return;

  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run('INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)', [message.author.id, 1, 0]);
    } else {
      let curLevel = Math.floor(0.3 * Math.sqrt(row.points + 1));
      if (curLevel > row.level) {
        row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
        const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setAuthor(message.author.tag, message.author.avatarURL || message.author.defaultAvatarURL)
        .setThumbnail(message.author.avatarURL || message.author.defaultAvatarURL)
        .setTitle('Seviye yükseldi;')
        .setDescription(`Tebrikler! Yeni seviyen DVE${curLevel}.`)
        .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
        .setTimestamp()
        message.channel.send(embed);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run('CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)').then(() => {
      sql.run('INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)', [message.author.id, 1, 0]);
    });
  });
  

  
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = message.content.split(' ')[0];
  command = command.slice(prefix.length);
  let args = message.content.split(' ').slice(1);
  let cont = message.content.slice(prefix.length).split(' ');
  let args2 = cont.slice(1);

  if (command === 'resim-değiştir') {
    if(message.author.id !== '380753087012405249') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Resim değiştir;').setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Resim değiştir;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Resim değiştir;').setDescription(message.author.tag + ', kullanım: dve!resim-değiştir <bağlantı>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    client.user.setAvatar(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Resim değiştir;')
    .setDescription(message.author.tag + ', profil resmim başarıyla değiştirildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  if (command === 'durum-değiştir') {
    if(message.author.id !== '380753087012405249') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Durum değiştir;').setDescription(message.author.tag + ', bu komutu yalnızca yapıım kullanabilir.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Durum değiştir;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Durum değiştir;').setDescription(message.author.tag + ', kullanım: dve!durum-değiştir <durum>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    client.user.setStatus(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Durum değiştir;')
    .setDescription(message.author.tag + ', durumum başarıyla değiştirildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'aktivite-değiştir') {
    if(message.author.id !== '380753087012405249') 
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Aktivite değiştir;').setDescription(message.author.tag + ', bu komutu yalnızca yapımcım kullanabilir.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Aktivite deği��tir;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Aktivite değiştir;').setDescription(message.author.tag + ', kullanım: dve!aktivite-değiştir <mesaj>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    client.user.setActivity(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Aktivite değiştir;')
    .setDescription(message.author.tag + ', aktivitem başarıyla değiştirildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  
  if (command === 'yapımcı') {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Yapımcı;')
    .setDescription('<@308533287721369600>')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'istatistik' || command === 'i') {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('İstatistik;')
    .addField('Gecikme:', client.ping + ' ms', true)
    .addField('Kullanıcılar:', client.guilds.reduce((a, b) => a + b.memberCount, 0), true)
    .addField('Kanallar:', client.channels.size, true)
    .addField('Sunucular:', client.guilds.size, true)
    .addField('Bellek kullanımı:', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), true)
    .addField('Discord.JS sürümü:', Discord.version, true)
    .setFooter('Dscord ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'sunucular' || command === 'bot-sunucu') {
    const guildArray = client.guilds.array()
    while (guildArray.length) {
    const embed = new Discord.RichEmbed();
    const guilds = guildArray.splice(0,25);
    for (const guild of guilds) {
      embed.setColor('RANDOM')
      embed.setTitle('Sunucular;')
      embed.setDescription(`Şu an ${client.guilds.size} sunucuda bulunuyorum.`)
      embed.addField(guild.name, guild.memberCount + ' üye.', true)
      embed.setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      embed.setTimestamp()
    }
    message.channel.send({embed: embed});
    
        };
  }
  if (command === 'profil' || command === 'profile') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Profil;').setDescription(message.author.tag + ', kullanım: dve!profil <@kullanıcı>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    sql.get(`SELECT * FROM scores WHERE userId ="${user.id}"`).then(row => {
      if (!row) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Profil;').setDescription(message.author.tag + ', hiç puanı yok.').setFooter('Dinle Ve Eğlen', client.user.avatarURL));
      economy.fetchBalance(user.id).then((i) => {
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setAuthor(user.tag, user.avatarURL || user.defaultAvatarURL)
    .setThumbnail(user.avatarURL || user.defaultAvatarURL)
    .setTitle('Profil;')
    .addField('Puan:', row.points, true)
    .addField('Seviye:', row.level, true)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
     })
   })
        };
  
  if (command === 'maden') {
    let sayılar = Math.floor(Math.random() * 50)
    message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazma işi başladı!').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp())
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %25.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %50.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %75.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazılıyor %100.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', maden kazma işi bitti!').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()))
      .then(nmsg => nmsg.edit(new Discord.RichEmbed().setColor('RANDOM').setTitle('Maden;').setDescription(message.author.tag + ', madenden ' + sayılar + ' ₺ kazandın!').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()))
        };
  
  if (command === 'kullanıcı' || command === 'kullanıcı-bilgi') {
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setAuthor(message.author.tag, message.author.avatarURL || message.author.defaultAvatarURL).setThumbnail(message.author.avatarURL || message.author.defaultAvatarURL).setTitle('Kullanıcı;').addField('Oyun:', message.author.presence.game ? message.author.presence.game.name : 'Oyun oynamıyor', true).addField('Kimlik:', message.author.id, true).addField('Bot:', message.author.bot ? '\n Evet' : 'Hayır', true).addField('Rolleri:', message.guild.member(message.author).roles.map(m => m.name).join(' | '), true).addField('Son gönderdiği mesaj:', message.author.lastMessage || 'Yok', true).addField('Son gönderdiği mesajın kimliği:',message.author.lastMessageID || 'Yok', true).addField('Oluşturma tarihi:', message.author.createdAt.toLocaleDateString(), true).setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setAuthor(user.tag, user.avatarURL || user.defaultAvatarURL)
      .setThumbnail(user.avatarURL || user.defaultAvatarURL)
      .setTitle('Kullanıcı;')
      .addField('Oyun:', user.presence.game ? user.presence.game.name : 'Oyun oynamıyor', true)
      .addField('Kimlik:', user.id, true)
      .addField('Bot:', user.bot ? '\n Evet' : 'Hayır', true)
      .addField('Rolleri:', message.guild.member(user).roles.map(m => m.name).join(' | '), true)
      .addField('Son gönderdiği mesaj:', user.lastMessage || 'Yok', true)
      .addField('Son gönderdiği mesajın kimliği:', user.lastMessageID || 'Yok', true)
      .addField('Oluşturma tarihi:', user.createdAt.toLocaleDateString(), true)
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
      message.channel.send(embed);
        };
  
  if (command === 'profil-resmi' || command === 'pp' || command === 'avatar') {
    let user = message.mentions.users.first();
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Profil resmi;').setImage(message.author.avatarURL || message.author.defaultAvatarURL).setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Profil resmi;')
    .setImage(user.avatarURL || user.defaultAvatarURL)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  

  if (command === 'si' || command === 'sunucubilgi') {
    const emojiList = message.guild.emojis.map(e=>e.toString()).join(' ');
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setAuthor(message.guild.name, message.guild.iconURL)
    .setThumbnail(message.guild.iconURL)
    .setTitle('Sunucu;')
    .addField('İsim kısaltması:', message.guild.nameAcronym, true)
    .addField('Kimliği:', message.guild.id, true)
    .addField('Bölgesi:', message.guild.region, true)
    .addField('Sahibi:', message.guild.owner, true)
    .addField('Doğrulama seviyesi:', message.guild.verificationLevel, true)
    .addField('Emojiler:', emojiList || 'Yok', true)
    .addField('Üyeler:', `${message.guild.members.filter(member => member.user.bot).size} bot / ${message.guild.memberCount} üye`, true)
    .addField('Varsayılan rol:', message.guild.defaultRole, true)
    .addField('Roller:', message.guild.roles.map(role => role.name).join(' | '), true)
    .addField('Kanallar:', `${message.guild.channels.filter(chan => chan.type === 'voice').size} sesli / ${message.guild.channels.filter(chan => chan.type === 'text').size} metin`, true)
    .addField('Kanal sayısı:', message.guild.channels.size, true)
    .addField('Ana kanalı:', message.guild.defaultChannel || 'Yok', true)
    .addField('Sistem kanalı:', message.guild.generalChannel || 'Yok', true)
    .addField('AFK kanalı:', message.guild.afkChannel || 'Yok', true)
    .addField('AFK zaman aşımı:', message.guild.afkTimeout + ' saniye', true)
    .addField('Oluşturma tarihi:', message.guild.createdAt.toLocaleDateString(), true)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'at' || command === 'kick') {
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    let guild = message.guild
    let reason = args.slice(1).join(' ');
    let user = message.mentions.users.first();
    let modlog = guild.channels.find('name', 'log');
    if (!modlog) return message.guild.createChannel('log');
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', kullanım: dve!at <@kullanıcı> <sebep>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (reason.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', kullanım: dve!at <@kullanıcı> sebep>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());

    if (!message.guild.member(user).kickable) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('At;').setDescription(message.author.tag + ', yetkilileri atamam.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    message.guild.member(user).kick();

    const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Sunucudan atıldın;')
      .setDescription(message.guild.name + ' adlı sunucudan atıldın.')
      .addField('Yetkili:', message.author.tag, true)
      .addField('Sebep:', reason, true)
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
    user.send(embed);
    const embed2 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('At;')
      .setDescription(user.tag + ' adlı kullanıcı başarıyla atıldı.')
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
    message.channel.send(embed2);
    const embed3 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('At;')
      .addField('Kullanıcı:', user.tag, true)
      .addField('Yetkili:', message.author.tag, true)
      .addField('Sebep:', reason, true)
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
    return guild.channels.get(modlog.id).send(embed3);
        };

  if (command === 'yasakla' || command === 'ban') {
    if (!message.member.permissions.has('BAN_MEMBERS')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    let guild = message.guild
    let reason = args.slice(1).join(' ');
    let user = message.mentions.users.first();
    let modlog = guild.channels.find('name', 'log');
    if (!modlog) return message.guild.createChannel('Log');
    if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', kullanım: dve!yasakla <@kullanıcı> <sebep>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (reason.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', kullanım: dve!yasakla <@kullanıcı> <sebep>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());

    if (!message.guild.member(user).bannable) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Yasakla;').setDescription(message.author.tag + ', yetkilileri yasaklayamam.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    message.guild.ban(user, 2);

    const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Sunucudan yasaklandın;')
      .setDescription(message.guild.name + ' adlı sunucudan yasaklandın.')
      .addField('Yetkili:', `${message.author.tag}`, true)
      .addField('Sebep:', reason, true)
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
    user.send(embed);
    const embed2 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yasakla;')
      .setDescription(user.tag + ' adlı kullanıcı başarıyla yasaklandı.')
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
    message.channel.send(embed2);
    const embed3 = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yasakla;')
      .addField('Kullanıcı:', `${user.tag}`, true)
      .addField('Yetkili:', `${message.author.tag}`, true)
      .addField('Sebep:', reason, true)
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
    return guild.channels.get(modlog.id).send(embed3);
        };

  if (command === 'uyar') {
    if (!message.member.permissions.has('KICK_MEMBERS')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
      let guild = message.guild
      let reason = args.slice(1).join(' ');
      let user = message.mentions.users.first();
      let modlog = guild.channels.find('name', 'log');
      if (!modlog) return message.guild.createChannel('log');
      if (message.mentions.users.size < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', kullanım: dve!uyar <@kullanıcı> <sebep>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
      if (reason.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Uyar;').setDescription(message.author.tag + ', kullanım: dve!uyar <@kullanıcı> <sebep>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());

      const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle('Sunucuda uyarıldın;')
        .setDescription(message.guild.name + ' adlı sunucuda uyarıldın.')
        .addField('Yetkili:', message.author.tag, true)
        .addField('Sebep:', reason, true)
        .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
        .setTimestamp()
      user.send(embed);
      const embed2 = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle('Uyar;')
        .setDescription(user.tag + ' adlı kullanıcı başarıyla uyarıldı.')
        .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
        .setTimestamp()
      message.channel.send(embed2);
      const embed3 = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle('Uyar;')
        .addField('Kullanıcı:', user.tag, true)
        .addField('Yetkili:', message.author.tag, true)
        .addField('Sebep:', reason, true)
        .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
        .setTimestamp()
      return guild.channels.get(modlog.id).send(embed3)
        };
 
  
  if (command === 'sunucu-adı-değiştir') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu adı değiştir;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu adı değiştir;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu adı değiştir;').setDescription(message.author.tag + ', kullanım: dve!sunucu-adı-değiştir <mesaj>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    message.guild.setName(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Sunucu adı değiştir;')
    .setDescription(message.author.tag + ', sunucu adı başarıyla değiştirildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'sunucu-resmi-değiştir') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu resmi değiştir;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu resmi değiştir;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Sunucu resmi değiştir;').setDescription(message.author.tag + ', kullanım: dve!sunucu-resmi-değiştir <bağlantı>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    message.guild.setIcon(sayMessage);
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Sunucu resmi değiştir;')
    .setDescription(message.author.tag + ', sunucu resmi başarıyla değiştirildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'kanal-aç') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kanal aç;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kanal aç;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    let mesaj = args.slice(0).join(' ');
    if (mesaj.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Kanal aç;').setDescription(message.author.tag + ', kullanım: dve!kanal-aç <mesaj>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    const channel = message.guild.createChannel(mesaj);
        };

  if (command === 'rol-oluştur') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rol oluştur;').setDescription(message.author.tag + ', bu komutu kullanmak için gerekli izinlere sahip değilsin.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rol oluştur;').setDescription(message.author.tag + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const sayMessage = args.join(' ');
    if (sayMessage.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rol oluştur;').setDescription(message.author.tag + ', kullanım: dve!rol-oluştur <mesaj>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    message.guild.createRole({
                    name: sayMessage,
                    color: "#FF4000",
                    permission:[]
            });
    const embed = new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle('Rol oluştur;')
     .setDescription(`Başarıyla rol oluşturdum!`)
     .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
     .setTimestamp()
     message.channel.send(embed);
     economy.updateBalance(message.author.id, parseInt(5)).then((i) => {
          console.log('+')
        });
  }
  if(command === 'mc-sunucu') {
    const IPhere = args.join(' ');
    if (IPhere.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', kullanım: dve!mc-sunucu <sunucu IP>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    var request = require('request');
      request('https://api.mcsrvstat.us/1/' + IPhere, function (error, response, body) {
      if(error) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', bir şeyler ters gitti.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());

      var bodyJSON = JSON.parse(body)
      if(bodyJSON.debug.ping !== true) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', bu sunucu kapalı.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
      var serverIP = bodyJSON.ip
      var serverPort = bodyJSON.port
      var motd1 = bodyJSON.motd.clean[0]
      var motd2 = bodyJSON.motd.clean[1]
      if(!motd2){ 
        var motd2 = "No second line.";
      }
      var version = bodyJSON.version
      var onlinePlayers = bodyJSON.players.online
      var maxPlayers = bodyJSON.players.max
      const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle(motd1)
        .addField('Sunucu IP:', `${serverIP}:${serverPort}`, true)
        .addField('Sürüm:', version, true)
        .addField('Açıklama:', `${motd1}\n${motd2}`)
        .addField('Oyuncular (çevrimiçi/toplam):', `${onlinePlayers}/${maxPlayers}`, true)
        .setFooter('Minecraft sunucu', client.user.avatarURL)
        .setTimestamp()
        message.channel.send({embed})
        .catch(error => message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Minecraft sunucu;').setDescription(message.author.tag + ', bir şeyler ters gitti.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()));
    });
  }
  
 
  
  if (command === 'sunucu-davet') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    message.guild.channels.get(message.channel.id).createInvite().then(invite =>
    message.channel.send('Bu sunucunun davet bağlantısı;\n' + invite.url)
   );
        };

  if (command === 'reklam-kontrol') {
    if (!message.guild) {
      return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Eval;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const members = message.guild.members.filter(member => member.user.presence.game && /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(member.user.presence.game.name))
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Reklam kontrol;').setDescription(members.map(member => member.displayName + ' adlı kullanıcının aktivite kısmında sunucu bağlantısı var.').join('\n') || message.author.username + ', kimse aktivite kısmına sunucu bağlantısı koymamış.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());

        };
  
  if (command === 'öneri') {
    let type = args.slice(0).join(' ');
        if (type.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Tavsiye;').setDescription(message.author.tag + ', kullanım: dve!tavsiye <mesaj>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Tavsiye;')
    .setDescription(message.author.tag + ', tavsiyeniz başarıyla gönderildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
    const embed2 = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Tavsiye;')
    .addField('Tavsiye:', type, true)
    .addField('Kullanıcı:', message.author.tag, true)
    .addField('Sunucu:', message.guild.name, true)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    client.channels.get('308533287721369600').send(embed2);
  }
  if (command === 'hata' || command === 'bug') {
    let type = args.slice(0).join(' ');
        if (type.length < 1) return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Hata;').setDescription(message.author.tag + ', kullanım: dve!hata <mesaj>.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp());
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Hata;')
    .setDescription(message.author.tag + ', hatanız başarıyla gönderildi.')
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
    const embed2 = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Hata;')
    .addField('Hata:', type, true)
    .addField('Kullanıcı:', message.author.tag, true)
    .addField('Sunucu:', message.guild.name, true)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    client.channels.get('308533287721369600').send(embed2);
        };
  
  if (command === 'oyun-öneri') {
    var cumleler= ['Grand Theft Auto', 'Minecraft', 'ROBLOX', 'Unturned', 'Creativerse', 'Prototype', 'Call of Duty', 'Zula', 'PLAYERUNKNOWNS BATTLEGROUNDS', 'League of Legends', 'Growtopia', 'Team Fortress', 'Counter-Strike', 'Garrys Mod', 'Black Desert Online', 'Rocket Leauge', 'Warframe', 'Battlefield', 'Half-Life', 'Rust', 'H1Z1', 'Fortnite', 'Overwatch', 'World of Tanks'];
    var cumle = cumleler[Math.floor(Math.random() * cumleler.length)];
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Oyun öneri;')
    .setDescription(cumle)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'espri' || command === 'espiri') {
    var espriler = ['Seni görünce; \ngözlerim dolar, \nkulaklarım euro.','Gidenin arkasına bakmayın yoksa geleni göremezsiniz.','+Oğlum canlılara örnek ver. \n-Kedi, köpek. \n+Cansızlara örnek ver. \n-Ölü kedi, ölü köpek.','+Kanka ben banyoya 3 kişi giriyorum. \n-Oha nasıl? \n+Hacı, Şakir ve ben. \n-Defol lan!','+Kocanızla ortak özelliğiniz ne? \n-Aynı gün evlendik.','+Evladım ödevini neden yapmadın? \n-Bilgisayarım uyku modundaydı, uyandırmaya kıyamadım.','+Bizim arkadaş ortamında paranın lafı bile olmaz. \n-Niye ki? \n+Çünkü hiç birimizin parası yok.','Annemin bahsettiği elalem diye bir örgüt var illuminatiden daha tehlikeli yemin ederim.','+Acıkan var mı ya? \n-Yok bizde tatlı kan var.','Yılanlardan korkma, yılmayanlardan kork.','+Baykuşlar vedalaşırken ne der? \n-Bay bay baykuş.','Beni Ayda bir sinemaya götürme, Marsta bir sinemaya götür.','Aaa siz çok terlemişsiniz durun size terlik getireyim.','Aklımı kaçırdım, 100.000 TL fidye istiyorum.'];
    var espri = espriler[Math.floor(Math.random() * espriler.length)];
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Espri;')
    .setDescription(espri)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'rastgele-sayı') {
    let sayılar = Math.floor(Math.random() * 100)
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Rastgele sayı;')
    .setDescription(sayılar)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };
  
  if (command === 'rastgele-kullanıcı') {
    if (!message.guild) {
    return message.channel.send(new Discord.RichEmbed().setColor('RANDOM').setTitle('Rastgele kullanıcı;').setDescription(message.author.username + ', bu komutu direkt mesajda kullanamazsın.').setFooter('Dinle Ve Eğlen', client.user.avatarURL).setTimestamp()); }
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Rastgele kullanıcı;')
    .setDescription(message.guild.members.random().displayName)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        };

  if (command === 'yazı-tura') {
    var result = Math.floor((Math.random() * 2) + 1);
    if (result == 1) {
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yazı-tura;')
      .setDescription('Tura.')
      .setImage('https://i.hizliresim.com/MaoYG2.jpg')
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
      message.channel.send(embed);
    } else if (result == 2) {
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle('Yazı-tura;')
      .setDescription('Yazı.')
      .setImage('https://i.hizliresim.com/QpvX3G.jpg')
      .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
      .setTimestamp()
      message.channel.send(embed);
    }
        };
  
  if (command === 'taş-kağıt-makas' || command === 'tkm') {
    var cumleler= ['Taş.', 'Kağıt.', 'Makas.'];
    var cumle = cumleler[Math.floor(Math.random() * cumleler.length)];
    const embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle('Taş-kağıt-makas;')
    .setDescription(cumle)
    .setFooter('Dinle Ve Eğlen', client.user.avatarURL)
    .setTimestamp()
    message.channel.send(embed);
        }; 
});



  


client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  if (message.author.id === ayarlar.sahip2) permlvl = 4;
  if (message.author.id === ayarlar.sahip3) permlvl = 4;
  return permlvl;
};



var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

const ytdl = require("ytdl-core");
const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./ayarlar');
const YouTube = require('simple-youtube-api');


const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('Müzik kodları Aktif! iyi dinlemeler moruk'));

client.on('disconnect', () => console.log('bağlantı kesildi. tekrar bağlanmaya çalışıyorum.'));

client.on('reconnecting', () => console.log('Tekrar bağlanıyorum..'));

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)

	if (command === 'oynat') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
		const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | İlk olarak sesli bir kanala giriş yapmanız gerek.'));
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('🚫 | Şuanda olduğunuz kanala girmek için gerekli izinlere sahip değilim.'));
		}
		if (!permissions.has('SPEAK')) {
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('🚫 | Şarkı başlatılamıyor. Lütfen mikrofonumu açınız.'));
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // ehehehehu videomuzu bulalım
				await handleVideo(video2, msg, voiceChannel, true); // ve gönderelim
			}
      return msg.channel.sendEmbed(new Discord.RichEmbed)
      .setDescription(`✔ | Playlist ➢ **${playlist.title}** has been added to the queue!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.sendEmbed(new Discord.RichEmbed().setDescription(`
__**Şarkı seçimi:**__ \n 
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
 \n **lütfen 1-10 arasında bir rakam seciniz 30 saniye içinde liste iptal edilecektir.**
`)
          .setColor('RANDOM'));
					// en fazla 5 tane 
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
            return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor('RANDOM')
            .setDescription('❎ | Şarkı seçimi iptal edildi. '));
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
          return msg.channel.sendEmbed(new Discord.RichEmbed()
          .setColor('RANDOM')
          .setDescription(' ❎ | Herhangi bir arama sonucu elde edemedim.'));
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'geç') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | Lütfen öncelikle sesli bir kanala katılınız.'));
		if (!serverQueue) return msg.channel.send(' ❎ | Kuyruk boş olduğu için geçemiyorum. ');
		serverQueue.connection.dispatcher.end('Geç komudu kullanıldı.');
		return undefined;
	} else if (command === 'qweqweqwedosgjsdflkh242309857238957y239856239856012356') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | Lütfen öncelikle sesli bir kanala katılınız.'));
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | Şu anda herhangi bir şarkı çalmıyorum.'));
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Kapat komutu kullanıldı!');
		return undefined;
	} else if (command === 'ses') {
    if (!message.guild) {
      if (!msg.guild) {
        const ozelmesajuyari = new Discord.RichEmbed()
        .setDescription(`You can not use commands here.`)
        return msg.author.sendEmbed(ozelmesajuyari); }
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
  .setDescription(' ❎ | Lütfen öncelikle sesli bir kanala katılınız.'));
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
   .setDescription(' ❎ | Şu anda herhangi bir şarkı çalmıyorum.'));
    if (!args[1]) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(` <:hope:412142425838977024> | Ses seviyesi: **${serverQueue.volume}**`));
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    (` <:hope:412142425838977024> | Yeni ses seviyesi: **${args[1]}**`));
      }
	} else if (command === 'şarkıadı') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`<:uyari:405162608631480320> | Şu anda hiçbir şey çalmıyorum.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription('There is nothing playing.'));
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(`🎶 Şu anda çalınan şarkı: **${serverQueue.songs[0].title}**`));
	} else if (command === 'kuyruk') {
		if (!serverQueue) return msg.channel.send('❎ | Şu anda hiçbir şey çalmıyorum. ');
		return msg.channel.send(`
__**Şarkı listesi:**__ \n 
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
\n **Şu anda çalınan:** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'durdur') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setDescription('⏸ | Müzik durduruldu.')
      .setColor('RANDOM'));
		}
		return msg.channel.send('🚫 | Şu anda hiçbir şey çalmıyorum.');
	} else if (command === 'devamet') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('▶ | Müzik şu anda devam ediyor..'));
		}
		return msg.channel.send('❎ | Şu anda hiçbir şey çalmıyorum.');
  }

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: video.title, 
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
    else return msg.channel.sendEmbed(new Discord.RichEmbed()
  .setDescription(`✔ | **${song.title}** adlı şarkı başarıyla kuyruğa eklendi.`)
  .setColor('RANDOM'));
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  serverQueue.textChannel.sendEmbed(new Discord.RichEmbed()
  .setDescription(`🎶 Çalınan şarkı: **${song.title}**`)
  .setColor('RANDOM'));
}


client.on('message', (message) => {
    if (message.content.toLowerCase() === prefix + 'gir') {
        if (!message.guild) {
            const ozelmesajuyari = new Discord.RichEmbed()
            .setDescription(`You can not use commands here.`)
            return message.author.sendEmbed(ozelmesajuyari); }
        try 
    {
    message.member.voiceChannel.join();
     return message.channel.sendEmbed(new Discord.RichEmbed()
     .setDescription(' Başarılı ➢**' + message.member.voiceChannel+ '** adlı kanala giriş yaptım. ')
     .setColor('RANDOM'));
    }
    catch(e) 
    {
    return message.channel.sendEmbed(new Discord.RichEmbed()
    .setDescription('❎ | Lütfen öncelikle sesli bir kanala katılınız.')
    .setColor('RANDOM'));
    }
    }

    if (message.content.toLocaleLowerCase() === prefix + 'kapat') {
        if (!message.guild) {
            const ozelmesajuyari = new Discord.RichEmbed()
            .setDescription(`You can not use commands here.`)
            return message.author.sendEmbed(ozelmesajuyari); }
            try
            {
                message.member.voiceChannel.leave();
                return message.channel.sendEmbed(new Discord.RichEmbed()
                .setDescription(' Başarılı ➢**' + message.member.voiceChannel+ '** adlı kanaldan çıkış yaptım.')
                .setColor('RANDOM'));
               }
               catch(e) 
               {
               return message.channel.sendEmbed(new Discord.RichEmbed()
               .setDescription('<:uyari:405162608631480320> | Lütfen öncelikle sesli bir kanala katılınız.')
               .setColor('RANDOM'));
               }
              }
          if (message.content.toLowerCase() === prefix + 'kanal bilgi' ) {
            if (!message.guild) {
              const ozelmesajuyari = new Discord.RichEmbed()
              .setDescription(`You can not use commands here.`)
              return message.author.sendEmbed(ozelmesajuyari); }
            try 
            {
           message.channel.sendEmbed(new Discord.RichEmbed().addField(' __Sesli kanal bilgileri__', ` **•** kanal ismi: **${message.member.voiceChannel.name}** \n **•** MAX kullanıcı sayısı: **${message.member.voiceChannel.userLimit}** \n **•** Bit hızı: **${message.member.voiceChannel.bitrate}** \n **•** kanal ID: **${message.member.voiceChannelID} ** \n **•** Kanal pozisyonu **${message.member.voiceChannel.position}**`).setColor('RANDOM'));
              }
              catch(e)
              {
                message.channel.sendEmbed(new Discord.RichEmbed()
                .setDescription('❎ | Lütfen öncelikle sesli bir kanala katılınız.')
                .setColor('RANDOM'));
              };
            }           
        });

client.login(process.env.BOT_TOKEN);

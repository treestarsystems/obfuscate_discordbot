const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('../../core/config.json');
let appInfo;

const exampleEmbed = new Discord.MessageEmbed()
 .setTitle('Young Grizzly on YouTube')
 .setURL('https://www.youtube.com/channel/UCmWXWbrAmM8Ytcwu_ar4PXg')

client.once('ready', () => {
 console.log('Obfuscate Bot is Ready!');
});

client.login(token.discordToken);

async function appSetup () {
 await client.fetchApplication().then((appInfoResponse) => appInfo = appInfoResponse);
}
appSetup();

function randomIndex(a) {
 let index  = a[Math.floor(Math.random() * a.length)];
 return index;
}

var greetingsGeneral = [
 "Sheed We HERE!",
 "What It Do?!",
 "Yah Momma...I mean Hiya.",
 "Listen bro, WHAT!",
 "You Again?",
 "I Got Whatcha Need!",
 "Fuck All Dat, You Got My Money?!"
];

function channelObfuscate (message) {
 if (message.content.includes(`!help`)) {
  message.channel.send(`<@!${message.author.id}> h0w M@y I h3Lp U$3?`);
 }
 if (message.content == '!news') {
  message.channel.send(`https://cointelegraph.com/news/oscar-mayer-auctions-one-off-pack-of-hot-doge-wieners`);
 }
}

function channelFinance (message) {
 if (message.content == '!news') {
  message.channel.send(`https://cointelegraph.com/news/oscar-mayer-auctions-one-off-pack-of-hot-doge-wieners`);
 }
}

function channelDM (message) {
 if (message.content == '!portfolio') {
  client.users.cache.get(message.author.id).send(`Damn, niggas wanna stick me for my paper.`);
 }
 if (message.content == '!cashapp') {
  client.users.cache.get(message.author.id).send(`$treestarsystems`);
 }
 if (message.content == '!youtube') {
//  client.users.cache.get(message.author.id).send(`[YouTube](https://www.youtube.com/channel/UCmWXWbrAmM8Ytcwu_ar4PXg)`);
  client.users.cache.get(message.author.id).send({embed: exampleEmbed});
 }
 if (message.content == '!help') {
  client.users.cache.get(message.author.id).send(`
  Wuz Good? Here is a Command Menu:
  * !portfolio - send portfolio update.
  * !cashapp - send CashApp info.
  * !youtube - send YouTube page link.
  `);
 }
}

client.on('message', async (message) => {
 let appID = appInfo.id;
 //All Channels
 if (message.content.toLowerCase().includes(`<@!${appID}> yo`)) {
  message.channel.send(`<@!${message.author.id}> ${randomIndex(greetingsGeneral)}`);
 }
 if (message.content == '$money') {
  message.channel.send(`<@!${message.author.id}> I mean if you want, I ain't gonna say no: $treestarsystems`);
 }
 if (message.content == '!slide-in-the-dms') {
  client.users.cache.get(message.author.id).send(`
  Wuz Good? Here is a Command Menu:
  * !portfolio - send portfolio update.
  * !cashapp - send CashApp info.
  * !youtube - send YouTube page link.
  `);
 }
 //Specific Channels
 if (message.channel.name == 'obfuscate') {
  channelObfuscate(message);
 }
 if (message.channel.type == 'dm') {
  channelDM(message);
 }
});

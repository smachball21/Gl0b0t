// DONT TOUCH
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

const fun = require("./function.js")

const queue = new Map();
const ytdl = require("ytdl-core");



client.on('ready', () => {
	
	// console.log(client)
	console.log('Bot connected as: ' + client.user.username);
	// client.user.setActivity(`*help [Gl0b0t]`, {type: "WATCHING"})
	
	setInterval(() => {
		var d = new Date();
		var n = d.toLocaleTimeString();
		client.user.setActivity("*help | "+n,{type: "WATCHING"});
	}, 10000);
});

client.once('reconnecting', () => {
 console.log('Reconnecting!');
});

client.once('disconnect', () => {
 console.log('Disconnect!');
});

client.on('message', message => {
	
	if (message.author.bot) return;
	if (message.content.indexOf(config.prefix) !== 0) return;
	if (message.channel.type == "dm") return;
  
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();   
    const serverQueue = queue.get(message.guild.id);
	
	if (command  === "ping") {
		fun.ping(client, message)
	}

	if (command === "help") {
		fun.help(client, message)
	}	
	
	if (command === "massivedm") {
		if (args.length === 0){	
			fun.msg(client, message, "Merci de renseigner l'identifiant du selon textuel")
		}else{
			fun.sendmassiveDM(client, message, args[0], config.delay)		
		}		
	}		
	
	if (command === "randomgif") {
		if (args.length === 0){	
			fun.gif(client, message, config.giphyAPIkey)
		} else {
			fun.gif(client, message, config.giphyAPIkey, args[0])
		}
	}	

	if (command === "textart") {
		if (args.length === 0){	
			fun.msg(client, message, "Merci d'indiquer le mot que vous souhaites transformer en art")
		}else{
			fun.play(client, message, args[0])		
		}	
	}

	// MUSIC BOT
	if (command === "play") {
		if (args.length === 0){	
			fun.msg(client, message, "Merci de renseigner l'URL d'une vidéo")
		}else{
			execute(message, serverQueue);
		}		
	}
	
	if (command === "stop") {
		stop(message, serverQueue);
	}
	
	if (command === "skip") {
		skip(message, serverQueue);
	}	
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return fun.msg(client, message,
      "Vous devez être dans un channel vocal pour lancer une musique !"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return fun.msg(client, message,
      "J'ai besoin d'avoir la permission de parler & de me connecter !"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
   };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`🕦 - **${song.title}** à été ajouté en file d'attente!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return fun.msg(client, message,
      "Vous devez être dans un channel vocal pour lancer une musique !"
    );
  if (!serverQueue)
    return fun.msg(client, message,"Il n'y à pas de music que je peux passer !");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return fun.msg(client, message,
 		"Vous devez être dans un channel vocal pour stopper la musique !"
    );
    
  if (!serverQueue)
    return fun.msg(client, message,"Il n'y a pas de musique que je peux stopper !");
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (! song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`📻 - Music en diffusion: **${song.title}**`);
}


client.login(config.token);
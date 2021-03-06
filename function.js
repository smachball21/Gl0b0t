module.exports = {
    ping: function(client, message) {
		var curChannel = client.channels.cache.get(message.channel.id);
		curChannel.send("I'm Here !")
	},
	sendmassiveDM: function(client, message, args, delay) {
		let filter = m => m.author.id === message.author.id
		var curChannel = client.channels.cache.get(message.channel.id);
		
		var targetChannel = client.channels.cache.get(args);
		
		if (! targetChannel) {
			curChannel.send("❌ - Identifiant de Channel invalide")
		}else{
			curChannel.send("📑 -  Merci d'indiquez le message que vous souhaitez envoyer").then( () => {
				message.channel.awaitMessages(filter, {
					max: 1,
						time: 30000,
						errors: ['time']
					})
					.then(message => {
						message = message.first()
						message.channel.send("✅ - Les DM sont en cours d'envoi. Un réponse sera transmise à la fin de l'envoi");
						let members = targetChannel.members
						
						console.log(members)
						var n = 0
						let membersarray = []
						
						var DMsucceed = 0
						var DMerror = 0

						members.forEach( (elm) => {
							
								membersarray[n] = elm
								n++
						})		
							
						var delayed = new Promise((resolve, reject) => {
							var error
							membersarray.forEach( (elm, i) => {
								error = false
								setTimeout( () => {
									if (elm.user.bot === false){
									    elm.send(message).catch( (err) => {
											error = true
										})
										
										if (error) {
											DMerror = DMerror + 1
											console.log("🛑 - Une erreur d'envoi pour l'utilisateur: " + elm.user.username)	
										}else{
											DMsucceed = DMsucceed + 1
											console.log("✅ - DM envoyé avec succès pour l'utilisateur: " + elm.user.username)	
										}
									}
									if (i === membersarray.length -1) resolve();
								}, i * delay)
							})
						});

						delayed.then( () => {
								console.log("All done !") 
								
								const Discord = require('discord.js');
								const EmbedMessage = new Discord.MessageEmbed()
								.setColor('#a4cd10')
								.setTitle('MassiveDM Results')
								.addFields(
									{ name: "Nombre d'envoi", value: DMsucceed+DMerror},
									{ name: "Nombre d'envoi en succès", value: DMsucceed},
									{ name: "Nombre d'envoi en erreur", value: DMerror},
								)
								
								curChannel.send(EmbedMessage)
								
								
						})
					})
					.catch(collected => {
						message.channel.send('⌚️ - Commande annulée pour inactivité');
					});			
			})						
		}		
	},
	msg: function(client, message, args) {
		var curChannel = client.channels.cache.get(message.channel.id);	
		curChannel.send("🛑 - "+args)
	},	
	gif: function(client, message, giphyAPIkey, args) {
		const giphyRandom = require("giphy-random");
		(async () => {
			var curChannel = client.channels.cache.get(message.channel.id);	

			if (args !== null){
				const { data } = await giphyRandom(giphyAPIkey,{
					type: "gif",
					tag: args
				})				
				curChannel.send(data.images.original.url)
			} else {
				const { data } = await giphyRandom(giphyAPIkey, {type: "gif"})
				curChannel.send(data.images.original.url)				
			}

		  

		})();
	},
	play: function(client, message, args, serverQueue) {	
	},
	textart: function(client, message, args) {
		
	},
	help: function(client, message) {
		const curChannel = client.channels.cache.get(message.channel.id);
		const Discord = require('discord.js');
		const EmbedMessage = new Discord.MessageEmbed()
		.setColor('#a4cd10')
		.setTitle('__Gl0B0t Commands__')
		.addFields(
			{ name: '** GLOBAL **', value: 'Main commands of the bot \n'},
			{ name: "*ping", value: "Get bot status"},
			{ name: "*randomgif {tag}", value: "Get random gif. Tag optionnal"},
			{ name: "*massivedm {channel}", value: "Send DM to all users of a channel"},
			{ name: "*help", value: "Get Commands"},	
			{ name: '\u200B', value: '\u200B' },
			{ name: '** MUSIC **', value: 'Commands for music bot \n'},
			{ name: "*play {url}", value: "Play YT Music"},
			{ name: "*stop", value: "Stop music bot"},
			{ name: "*skip", value: "Skip to next music"},
		)									
		curChannel.send(EmbedMessage)		
	}
};
// DONT TOUCH
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

const fun = require("./function.js");

const queue = new Map();
const ytdl = require("ytdl-core");

const music = require("./music");

client.on("ready", () => {
  // console.log(client)
  console.log("Bot connected as: " + client.user.username);
  // client.user.setActivity(`*help [Gl0b0t]`, {type: "WATCHING"})

  setInterval(() => {
    var d = new Date();
    var n = d.toLocaleTimeString();
    client.user.setActivity("*help | " + n, { type: "WATCHING" });
  }, 10000);
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;
  if (message.channel.type == "dm") return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const serverQueue = queue.get(message.guild.id);

  if (command === "ping") {
    fun.ping(client, message);
  }

  if (command === "help") {
    fun.help(client, message);
  }

  if (command === "massivedm") {
    if (args.length === 0) {
      fun.msg(
        client,
        message,
        "Merci de renseigner l'identifiant du selon textuel"
      );
    } else {
      fun.sendmassiveDM(client, message, args[0], config.delay);
    }
  }

  if (command === "randomgif") {
    if (args.length === 0) {
      fun.gif(client, message, config.giphyAPIkey);
    } else {
      fun.gif(client, message, config.giphyAPIkey, args[0]);
    }
  }

  if (command === "textart") {
    if (args.length === 0) {
      fun.msg(
        client,
        message,
        "Merci d'indiquer le mot que vous souhaites transformer en art"
      );
    } else {
      fun.play(client, message, args[0]);
    }
  }

  // MUSIC BOT
  if (command === "play") {
    if (args.length === 0) {
      fun.msg(client, message, "Merci de renseigner l'URL d'une vidéo");
    } else {
      music.execute(client, message, queue, serverQueue, args);
    }
  }

  if (command === "stop") {
    music.stop(client, message, queue);
  }

  if (command === "skip") {
    music.skip(client, message, queue);
  }
});

client.login(config.token);

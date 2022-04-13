const { YouTube } = require("popyt");
const ytdl = require("ytdl-core");
const fun = require("./function.js");

const config = require("./config.json");
let { YOUTUBE_API_KEY } = config;

const youtube = new YouTube(YOUTUBE_API_KEY, undefined, { cache: true });

const execute = async (client, message, queue, serverQueue, args) => {
  const voiceChannel = message.member.voice.channel;

  // CHECK Voice && Permission
  if (!voiceChannel) {
    return fun.msg(
      client,
      message,
      "Vous devez être dans un channel vocal pour lancer une musique !"
    );
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);

  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return fun.msg(
      client,
      message,
      "J'ai besoin d'avoir la permission de parler & de me connecter !"
    );
  }

  let songInfo;

  if (args.join().includes("youtube.com")) {
    songInfo = await ytdl.getInfo(args[0]);
  } else {
    try {
      const music = await youtube.getVideo(args.join(" "));
      songInfo = await ytdl.getInfo(music.url);
    } catch (e) {
      return fun.msg(
        client,
        message,
        `Une erreur est survenue ! : ${e.message} \nCe message est surement dû à une restriction d'age sur la vidéo`
      );
    }
  }
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 3,
      playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;

      play(message.guild, queueConstruct.songs[0], client, message, queue);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(
      `🕦 - **${song.title}** à été ajouté en file d'attente!`
    );
  }
};

const play = (guild, song, client, message, queue) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0], client, message, queue);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  fun.msg(client, message, `📻 - Music en diffusion: **${song.title}**`);
};

const skip = (client, message, queue) => {
  const serverQueue = queue.get(message.guild.id);
  if (!message.member.voice.channel)
    return fun.msg(
      client,
      message,
      "Vous devez être dans un channel vocal pour skipper une musique !"
    );
  if (!serverQueue)
    return fun.msg(
      client,
      message,
      "Il n'y à pas de music que je peux passer !"
    );
  serverQueue.connection.dispatcher.end();
};

const stop = (client, message, queue) => {
  const serverQueue = queue.get(message.guild.id);

  if (!message.member.voice.channel)
    return fun.msg(
      client,
      message,
      "Vous devez être dans un channel vocal pour stopper une musique !"
    );

  if (!serverQueue) {
    return fun.msg(
      client,
      message,
      "Il n'y a pas de musique que je peux stopper !"
    );
  }

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

//======================================================================//
// EXPORT FUNCTIONS
//======================================================================//
module.exports = {
  play: play,
  stop: stop,
  skip: skip,
  execute: execute,
};
//======================================================================//

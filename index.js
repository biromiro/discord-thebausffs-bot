
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  }else if (message.content.startsWith(`${prefix}help`)){
    help(message);
    return;
  } else {
    execute(message, serverQueue);
    return;
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");
  let val = args[0].substr(1);
  console.log(val);

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  const song = {
        title: '',
        info: '',
   };

  switch(val){
      case `shilling`:
          val = "https://www.youtube.com/watch?v=jPaa8XJ683E&ab_channel=Shacozzi";
          song.title = "Wp gg 😃 Joking 😂 We shilling 😎 Solobolo 😱";
          break;
      case `pogchamp`:
          val = "https://www.youtube.com/watch?v=yC3gNOCLLXM";
          song.title = "POGCHAMP :fist: :pensive:";
          break;
      case `cum`:
          val = "https://www.youtube.com/watch?v=PIsCct_LBrQ&ab_channel=PoodlersFreitas";
          song.title = "CUM :drool: CUM :drool: CUM :drool: CUM :drool:"
          break;
      case `disoster`:
           val = "https://www.youtube.com/watch?v=PIsCct_LBrQ&ab_channel=PoodlersFreitas";
          break;
      case `joking`:
           val = "https://www.youtube.com/watch?v=PIsCct_LBrQ&ab_channel=PoodlersFreitas";
          break;
      case `whatisthat`:
           val = "https://www.youtube.com/watch?v=PIsCct_LBrQ&ab_channel=PoodlersFreitas";
          break;
      case `combo`:
           val = "https://www.youtube.com/watch?v=PIsCct_LBrQ&ab_channel=PoodlersFreitas";
           song.title = "COMBO";
          break;
      default:
          message.channel.send("You need to enter a valid command!");
          return;
  };

   song.info = await ytdl.getInfo(val);


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
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
    
  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl.downloadFromInfo(song.info, {filter : 'videoandaudio'}))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Playing: **${song.title}**`);
}

function help(message) {
    message.channel.send(
      "Available commands: shilling, pogchamp, cum, disoster, joking, whatisthat, combo, help, skip, stop"
    );
}

client.login(token);

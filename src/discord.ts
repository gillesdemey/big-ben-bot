import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Guild,
  type GuildBasedChannel,
} from "discord.js";
import { getNumberOfChimes } from "./utils.ts";

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID ?? "";

const introSoundPath = import.meta.resolve("./assets/intro.mp3");
const dongSoundPath = import.meta.resolve("./assets/dong.mp3");

async function playBigBen(connection: VoiceConnection) {
  const player = createAudioPlayer(); // Create an audio player
  const subscription = connection.subscribe(player); // Subscribe the connection to the player

  await new Promise((resolve, reject) => {
    player.on("error", (error: unknown) => {
      subscription?.unsubscribe();
      reject(error);
    });

    resolve(undefined);
  });

  // compute number of chimes
  const hours = getNumberOfChimes();
  console.log(`We will chime ${hours} times`);

  await playIntro(player);
  for (let i = 0; i < hours; i++) {
    await playChime(player);
  }
}

function playChime(player: AudioPlayer) {
  const resource = createAudioResource(dongSoundPath);
  player.play(resource);

  console.log("Bong...");
  return new Promise((resolve, reject) => {
    player.once("error", reject);

    player.once(AudioPlayerStatus.Playing, () => {
      player.once(AudioPlayerStatus.Idle, () => {
        resolve(undefined);
      });
    });
  });
}

function playIntro(player: AudioPlayer) {
  const resource = createAudioResource(introSoundPath);
  player.play(resource);

  console.log("Playing intro...");
  return new Promise((resolve, reject) => {
    player.once("error", reject);

    player.once(AudioPlayerStatus.Playing, () => {
      player.once(AudioPlayerStatus.Idle, () => {
        resolve(undefined);
      });
    });
  });
}

function joinChannel(guild: Guild, id: string): VoiceConnection {
  return joinVoiceChannel({
    channelId: id,
    guildId: guild.id,
    // @ts-ignore
    adapterCreator: guild.voiceAdapterCreator,
  });
}

function getFirstVoiceChannel(guild: Guild) {
  // Filter and get only the voice channels
  const voiceChannels = guild.channels.cache.filter(
    (channel: GuildBasedChannel) => channel.type === ChannelType.GuildVoice,
  );

  return voiceChannels.first();
}

function authenticate(client: Client) {
  return new Promise((resolve, reject) => {
    client.on("error", reject);
    client.on("ready", () => resolve(undefined));

    client.login(token);
  });
}

export async function setup() {
  const client = createClient();

  console.log("Authenticating...");
  await authenticate(client);
  console.log("Authenticated!");

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error("Guild not found");
  }

  const firstVoiceChannel = getFirstVoiceChannel(guild);
  if (!firstVoiceChannel) {
    throw new Error("No voice channels found in the guild");
  }

  const connection = joinChannel(guild, firstVoiceChannel.id);
  try {
    await playBigBen(connection);
  } catch (error) {
    console.log("An error occurred:", error);
  } finally {
    connection.disconnect();
  }

  return client;
}

function createClient() {
  return new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
}

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  }
});

client.player = player;
player.extractors.loadMulti(DefaultExtractors);

client.player.events.on('playerStart', (queue, track) => {
  const channel = queue.metadata?.channel;
  const user = queue.metadata?.requestedBy;

  if (!channel) return;

  const embed = {
    title: `🎶 Now Playing: ${track.title}`,
    url: track.url,
    description: `Requested by ${user ? `<@${user.id}>` : 'Unknown'}`,
    thumbnail: { url: track.thumbnail || track.__metadata?.artwork_url || null },
    fields: [
      { name: 'Duration', value: track.duration || 'Unknown', inline: true },
      { name: 'Author', value: track.author || track.__metadata?.publisher_metadata?.artist || 'Unknown', inline: true },
      { name: 'Source', value: track.raw?.source || 'Unknown', inline: true }
    ],
    color: 0x1DB954
  };

  channel.send({ embeds: [embed] }).catch(console.error);
});

client.player.events.on('playerError', (queue, error) => {
  console.error(` Player Error in [${queue.guild.name}]:`, error.message);
  const channel = queue.metadata?.channel;
  if (channel) {
    channel.send(`An error occurred while playing audio:\n\`${error.message}\``).catch(() => {});
  }
});



client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
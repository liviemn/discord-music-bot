const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the current music queue'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({
        content: '❌ There is no music playing in this server.',
        ephemeral: true
      });
    }

    const currentTrack = queue.currentTrack;
    const upcomingTracks = queue.tracks.toArray().slice(0, 5);

    const embed = {
      title: '🎶 Music Queue',
      description: `**Now Playing:** [${currentTrack.title}](${currentTrack.url})\n\n` +
        (upcomingTracks.length > 0
          ? upcomingTracks.map((track, i) => `${i + 1}. [${track.title}](${track.url})`).join('\n')
          : 'No other tracks in the queue.'),
      color: 0x1DB954,
      footer: {
        text: `Total tracks: ${queue.tracks.size + 1}` // +1 includes current track
      }
    };

    return interaction.reply({ embeds: [embed] });
  }
};

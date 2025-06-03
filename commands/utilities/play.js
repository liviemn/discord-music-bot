const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const playdl = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube or other sources')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Search term or URL')
        .setRequired(true)
    ),
  async execute(interaction) {
    const player = useMainPlayer();
    const query = interaction.options.getString('query');
    const channel = interaction.member.voice.channel;

    if (!channel)
      return interaction.reply({ content: '❌ You must be in a voice channel!', ephemeral: true });

    await interaction.deferReply();

    try {
      const { track } = await player.play(channel, query, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel
          }
        }
      });

      await interaction.followUp(`✅ **${track.title}** has been added to the queue!`);


      const embed = {
        title: `🎶 Now Playing: ${track.title}`,
        url: track.url,
        description: `Requested by <@${interaction.user.id}>`,
        thumbnail: {
          url: track.thumbnail
        },
        fields: [
          {
            name: 'Duration',
            value: track.duration,
            inline: true
          },
          {
            name: 'Author',
            value: track.author,
            inline: true
          },
          {
            name: 'Source',
            value: track.raw.source || 'Unknown',
            inline: true
          }
        ],
        color: 0x1DB954
      };

      return interaction.followUp({ embeds: [embed] });
    } catch (error) {
      return interaction.followUp(`❌ Failed to play: ${error.message}`);
    }
  }
};

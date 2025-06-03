const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube (URL or search query)')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('YouTube URL or search keywords')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const query = interaction.options.getString('query');
      const player = interaction.client.player;

      const { track } = await player.play(voiceChannel, query, {
        nodeOptions: {
          metadata: interaction,
          leaveOnEnd: false,
        }
      });

      await interaction.editReply(`▶️ Now playing: **${track.title}**`);
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Something went wrong while trying to play the track.');
    }
  }
};

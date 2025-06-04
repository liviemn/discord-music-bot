const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

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

    if (!channel) {
      return interaction.reply({
        content: 'You must be in a voice channel!',
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();
      const existingQueue = player.nodes.get(interaction.guildId);
      const isQueueActive = existingQueue && existingQueue.isPlaying();

      const { track } = await player.play(channel, query, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            requestedBy: interaction.user
          }
        }
      });

      return interaction.followUp(`**${track.title}** has been added to the queue!`);


    } catch (error) {
      console.error(error);
      return interaction.followUp({
        content: `Failed to play: ${error.message}`,
        ephemeral: true
      });
    }
  }
};

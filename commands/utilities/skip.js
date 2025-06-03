const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing track'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({
        content: '❌ There is no track currently playing.',
        ephemeral: true
      });
    }

    const currentTrack = queue.currentTrack;

    queue.node.skip();

    return interaction.reply(`⏭️ Skipped **${currentTrack.title}**`);
  }
};

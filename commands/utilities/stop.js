const {SlashCommandBuilder} = require('discord.js');
const {useMainPlayer} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue'),

    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
            content: 'There is no music playing.',
            });
        }

        queue.delete();

        return interaction.reply('Music stopped and queue cleared.');
    }
}
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-bad-words")
    .setDescription("List all words currently in the bad word filter."),
  async execute(interaction) {
    const client = interaction.client;
    const badWords = (client.badWordFilter || []).map((w) => w.toLowerCase());
    if (badWords.length === 0) {
      await interaction.reply({
        embeds: [
          {
            title: "Bad Word Filter",
            description: "🚫 The bad word filter is currently empty.",
            color: 0x1e66f5,
          },
        ],
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      embeds: [
        {
          title: "Bad Word Filter",
          description: badWords.map((w) => `• ${w}`).join("\n"),
          color: 0x1e66f5,
        },
      ],
      ephemeral: true,
    });
  },
};

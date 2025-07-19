const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bad-word-filter")
    .setDescription("Enable or disable a word in the bad word filter.")
    .addBooleanOption((option) =>
      option
        .setName("toggle")
        .setDescription("Enable or disable filter")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("word").setDescription("Word to filter").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: "Ephemeral" });
    const toggle = interaction.options.getBoolean("toggle");
    const word = interaction.options.getString("word");
    if (toggle === null) {
      await interaction.editReply(
        "⚠️ Please specify whether to enable or disable the filter."
      );
      return;
    }
    if (!word) {
      await interaction.editReply("⚠️ Please provide a word to filter.");
      return;
    }
    try {
      const client = interaction.client;
      const filter = client.badWordFilter || [];
      if (toggle) {
        if (!filter.includes(word)) {
          filter.push(word);
          client.badWordFilter = filter;
          await interaction.editReply(
            `✅ Bad word filter enabled. Filtering out: **${word}**`
          );
        } else {
          await interaction.editReply(
            "⚠️ This word is already in the bad word filter."
          );
        }
      } else {
        const index = filter.indexOf(word);
        if (index > -1) {
          filter.splice(index, 1);
          client.badWordFilter = filter;
          await interaction.editReply(
            `✅ Bad word filter disabled for: **${word}**`
          );
        } else {
          await interaction.editReply(
            "⚠️ This word is not in the bad word filter."
          );
        }
      }
    } catch (error) {
      console.error(`❌ Error updating bad word filter: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while updating the bad word filter."
      );
    }
  },
};

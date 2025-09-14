const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("expunge-message")
    .setDescription("Delete a number of messages from a text channel.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Text channel").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: "Ephemeral" });
    const amount = interaction.options.getInteger("amount");
    const channel = interaction.options.getChannel("channel");
    if (!channel.isTextBased()) {
      await interaction.editReply("⚠️ Please select a valid text channel.");
      return;
    }
    if (amount < 1 || amount > 100) {
      await interaction.editReply(
        "⚠️ You must specify between 1 and 100 messages to delete."
      );
      return;
    }
    try {
      const messages = await channel.messages.fetch({ limit: amount });
      const deleted = await channel.bulkDelete(messages, true);
      await interaction.editReply(
        `✅ Successfully deleted ${deleted.size} messages from ${channel}.`
      );
    } catch (error) {
      console.error(`❌ Error deleting messages: ${error}`);
      await interaction.editReply({
        content: "❌ An error occurred while deleting messages.",
        flags: "Ephemeral",
      });
    }
  },
};

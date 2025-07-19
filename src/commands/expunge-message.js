module.exports = async function expungeMessage(interaction) {
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
};

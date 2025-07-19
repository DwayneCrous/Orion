const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-slowmode")
    .setDescription("Set slowmode duration for a text channel.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Text channel").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration in seconds")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({});
    const channel = interaction.options.getChannel("channel");
    const duration = interaction.options.getInteger("duration");
    if (!channel.isTextBased()) {
      await interaction.editReply("⚠️ Please select a valid text channel.");
      return;
    }
    if (duration < 0) {
      await interaction.editReply(
        "⚠️ Please provide a valid duration in seconds (0 or more)."
      );
      return;
    }
    try {
      await channel.setRateLimitPerUser(duration);
      await interaction.editReply(
        `✅ Successfully set slowmode for **${channel.name}** to ${duration} seconds.`
      );
    } catch (error) {
      console.error(`❌ Error setting slowmode: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to set slowmode."
      );
    }
  },
};

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute-user")
    .setDescription("Mute a user for a specified duration in seconds.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to mute").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration in seconds")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: "Ephemeral" });
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    if (!user) {
      await interaction.editReply("⚠️ Please specify a user to mute.");
      return;
    }
    if (!duration || duration < 1) {
      await interaction.editReply(
        "⚠️ Please provide a valid duration in seconds."
      );
      return;
    }
    try {
      const member =
        interaction.guild.members.cache.get(user.id) ??
        (await interaction.guild.members.fetch(user.id).catch(() => null));
      if (!member) {
        await interaction.editReply("⚠️ That user is not in this server.");
        return;
      }
      if (!member.moderatable) {
        await interaction.editReply(
          "⚠️ I can't mute this user. They might have a higher role or I lack permissions."
        );
        return;
      }
      await member.timeout(duration * 1000);
      await interaction.editReply(
        `✅ Successfully muted **${user.tag}** for ${duration} seconds.`
      );
    } catch (error) {
      console.error(`❌ Error muting user: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to mute the user."
      );
    }
  },
};

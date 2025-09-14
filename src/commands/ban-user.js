const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban-user")
    .setDescription("Ban a user from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for ban")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: "Ephemeral" });
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    if (!user) {
      await interaction.editReply("⚠️ Please specify a user to ban.");
      return;
    }
    if (!reason) {
      await interaction.editReply("⚠️ Please provide a reason for the ban.");
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
      if (!member.bannable) {
        await interaction.editReply(
          "⚠️ I can't ban this user. They might have a higher role or I lack permissions."
        );
        return;
      }
      await member.ban({ reason });
      await interaction.editReply(
        `✅ Successfully banned **${user.tag}** from the server.`
      );
    } catch (error) {
      console.error(`❌ Error banning user: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to ban the user."
      );
    }
  },
};

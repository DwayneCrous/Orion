const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-role")
    .setDescription("Assign a role to a member.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Member to assign the role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role to assign").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: "Ephemeral" });
    const role = interaction.options.getRole("role");
    const user = interaction.options.getUser("member");
    if (!role || !user) {
      await interaction.editReply(
        "⚠️ Please specify both a role and a member to assign the role to."
      );
      return;
    }
    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);
    if (!member) {
      await interaction.editReply(
        "⚠️ Could not find that member in this server."
      );
      return;
    }
    try {
      await member.roles.add(role);
      await interaction.editReply(
        `✅ Successfully assigned the role **${role.name}** to ${user.username}.`
      );
    } catch (error) {
      console.error(`❌ Error assigning role: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to assign the role."
      );
    }
  },
};

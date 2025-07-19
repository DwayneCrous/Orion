module.exports = async function setRole(interaction) {
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
};

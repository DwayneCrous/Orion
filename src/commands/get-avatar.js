const { EmbedBuilder } = require("discord.js");

module.exports = async function getAvatar(interaction) {
  await interaction.deferReply({});
  const user = interaction.options.getUser("user");
  if (!user) {
    await interaction.editReply(
      "⚠️ Please specify a user to get the avatar of."
    );
    return;
  }
  const embed = new EmbedBuilder()
    .setTitle(`${user.username}'s Avatar`)
    .setImage(user.displayAvatarURL({ size: 512, dynamic: true }))
    .setColor("#179299");
  await interaction.editReply({ embeds: [embed] });
};

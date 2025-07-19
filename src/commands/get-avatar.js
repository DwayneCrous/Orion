const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-avatar")
    .setDescription("Get the avatar of a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to get avatar of")
        .setRequired(true)
    ),
  async execute(interaction) {
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
  },
};

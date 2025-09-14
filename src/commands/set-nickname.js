const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-nickname")
    .setDescription("Set a user's nickname.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to set nickname for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("New nickname")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({});
    const user = interaction.options.getUser("user");
    const nickname = interaction.options.getString("nickname");
    if (!user) {
      await interaction.editReply(
        "⚠️ Please specify a user to set the nickname for."
      );
      return;
    }
    if (!nickname) {
      await interaction.editReply("⚠️ Please provide a new nickname.");
      return;
    }
    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.setNickname(nickname);
      await interaction.editReply(
        `✅ Successfully set the nickname for **${user.tag}** to **${nickname}**.`
      );
    } catch (error) {
      console.error(`❌ Error setting nickname: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to set the nickname."
      );
    }
  },
};

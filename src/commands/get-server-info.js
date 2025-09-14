const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-server-info")
    .setDescription("Get information about the current server."),
  async execute(interaction) {
    await interaction.deferReply({});
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply(
        "⚠️ This command can only be used in a server."
      );
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`Server Info: ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 512, dynamic: true }))
      .setColor("#209fb5")
      .addFields(
        { name: "Server ID", value: guild.id, inline: true },
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "Member Count", value: `${guild.memberCount}`, inline: true },
        {
          name: "Created At",
          value: guild.createdAt.toDateString(),
          inline: true,
        }
      )
      .setFooter({ text: "Server Information" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};

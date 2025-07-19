const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dwayne-github")
    .setDescription("Get a link to Dwayne's GitHub profile."),
  async execute(interaction) {
    await interaction.deferReply({});
    const embed = new EmbedBuilder()
      .setTitle("Dwayne's GitHub")
      .setDescription(
        "Click [here](https://github.com/DwayneCrous) to visit Dwayne's GitHub profile!"
      )
      .setColor("#df8e1d")
      .setFooter({ text: "Dwayne's GitHub" });
    await interaction.editReply({ embeds: [embed] });
  },
};

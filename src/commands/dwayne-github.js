const { EmbedBuilder } = require("discord.js");

module.exports = async function dwayneGithub(interaction) {
  await interaction.deferReply({});
  const embed = new EmbedBuilder()
    .setTitle("Dwayne's GitHub")
    .setDescription(
      "Click [here](https://github.com/DwayneCrous) to visit Dwayne's GitHub profile!"
    )
    .setColor("#df8e1d")
    .setFooter({ text: "Dwayne's GitHub" });
  await interaction.editReply({ embeds: [embed] });
};

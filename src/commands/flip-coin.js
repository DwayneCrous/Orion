const { EmbedBuilder } = require("discord.js");

module.exports = async function flipCoin(interaction) {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  const embed = new EmbedBuilder()
    .setTitle("🪙 Coin Flip Result")
    .setDescription(`The coin landed on: **${result}**`)
    .setColor("#8839ef")
    .setFooter({ text: "Coin Flip Game" })
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
};

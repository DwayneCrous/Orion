const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("flip-coin")
    .setDescription("Flip a coin and get heads or tails."),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    const embed = new EmbedBuilder()
      .setTitle("🪙 Coin Flip Result")
      .setDescription(`The coin landed on: **${result}**`)
      .setColor("#8839ef")
      .setFooter({ text: "Coin Flip Game" })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

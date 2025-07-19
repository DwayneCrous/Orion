const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dice-roll")
    .setDescription("Roll a six-sided dice."),
  async execute(interaction) {
    const result = Math.floor(Math.random() * 6) + 1;
    const embed = new EmbedBuilder()
      .setTitle("🎲 Dice Roll Result")
      .setDescription(`You rolled a **${result}**`)
      .setColor("#d20f39")
      .setFooter({ text: "Dice Roll Game" })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

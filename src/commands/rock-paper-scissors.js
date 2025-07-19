const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rock-paper-scissors")
    .setDescription("Play rock-paper-scissors against the bot.")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Your choice: rock, paper, or scissors")
        .setRequired(true)
        .addChoices(
          { name: "rock", value: "rock" },
          { name: "paper", value: "paper" },
          { name: "scissors", value: "scissors" }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const userChoice = interaction.options.getString("choice");
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result;
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "You win!";
    } else {
      result = "You lose!";
    }
    const embed = new EmbedBuilder()
      .setTitle("🪨📄✂️ Rock-Paper-Scissors Result")
      .setDescription(
        `You chose: **${userChoice}**\nBot chose: **${botChoice}**\nResult: **${result}**`
      )
      .setColor("#fe640b")
      .setFooter({ text: "Rock Paper Scissors Game" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};

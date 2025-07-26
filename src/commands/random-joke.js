const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-joke")
    .setDescription("Replies with a random joke"),
  async execute(interaction) {
    try {
      const response = await fetch(
        "https://official-joke-api.appspot.com/random_joke"
      );
      if (!response.ok) throw new Error("Failed to fetch joke");
      const data = await response.json();
      const joke = `${data.setup}\n${data.punchline}`;
      await interaction.reply(joke);
    } catch (error) {
      await interaction.reply("Sorry, I couldn't fetch a joke right now.");
    }
  },
};

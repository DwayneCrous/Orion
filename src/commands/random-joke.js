const { SlashCommandBuilder } = require("discord.js");
let fetchImpl;
try {
  fetchImpl = global.fetch ? global.fetch : require("node-fetch");
} catch (e) {
  fetchImpl = require("node-fetch");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-joke")
    .setDescription("Replies with a random joke"),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const response = await fetchImpl(
        "https://official-joke-api.appspot.com/random_joke"
      );
      if (!response.ok)
        throw new Error(
          `Failed to fetch joke: ${response.status} ${response.statusText}`
        );
      const data = await response.json();
      const joke = `${data.setup}\n${data.punchline}`;
      await interaction.editReply(joke);
    } catch (error) {
      console.error("Random Joke Command Error:", error);
      await interaction.editReply(
        "Sorry, I couldn't fetch a joke right now.\n" + (error.message || error)
      );
    }
  },
};

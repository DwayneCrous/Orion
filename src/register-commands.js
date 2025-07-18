require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  // Server utility commands
  new SlashCommandBuilder()
    .setName("todays-overview")
    .setDescription("Provides an overview of today's weather and latest news"),
  new SlashCommandBuilder()
    .setName("get-avatar")
    .setDescription("Gets the avatar of a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the avatar of")
        .setRequired(true)
    ),

  // API commands
  new SlashCommandBuilder()
    .setName("get-weather")
    .setDescription("Gets the current weather for a location")
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("The location to get the weather for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("units")
        .setDescription("The units for the temperature")
        .setRequired(true)
        .addChoices(
          { name: "Celsius", value: "metric" },
          { name: "Fahrenheit", value: "imperial" }
        )
    ),
  new SlashCommandBuilder()
    .setName("currency-convert")
    .setDescription("Converts an amount from one currency to another")
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to convert")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("from_currency")
        .setDescription("The currency to convert from")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("to_currency")
        .setDescription("The currency to convert to")
        .setRequired(true)
    ),

  // Moderation commands
  new SlashCommandBuilder()
    .setName("expunge-message")
    .setDescription(
      "Deletes a specified amount of the latest messages from a channel"
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The number of messages to delete")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to delete messages from")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("kick-user")
    .setDescription("Kicks a user from the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for kicking the user")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("ban-user")
    .setDescription("Bans a user from the server")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for banning the user")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("mute-user")
    .setDescription("Mutes a user for a specified duration")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to mute")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the mute (in seconds)")
        .setRequired(true)
        .setMinValue(1)
    ),
  new SlashCommandBuilder()
    .setName("bad-word-filter")
    .setDescription("Automatically deletes messages containing banned words")
    .addBooleanOption((option) =>
      option
        .setName("toggle")
        .setDescription("Enable or disable the bad word filter")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("Words to filter")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("set-slowmode")
    .setDescription("Sets a slowmode for a channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to set slowmode for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the slowmode in seconds")
        .setRequired(true)
        .setMinValue(0)
    ),

  // Mini Games
  new SlashCommandBuilder()
    .setName("flip-coin")
    .setDescription("Flips a coin and returns heads or tails"),
  new SlashCommandBuilder()
    .setName("dice-roll")
    .setDescription("Rolls a dice and returns a number between 1 and 6"),
  new SlashCommandBuilder()
    .setName("rock-paper-scissors")
    .setDescription("Play rock-paper-scissors with the bot")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Your choice (rock, paper, or scissors)")
        .setRequired(true)
        .addChoices(
          { name: "Rock", value: "rock" },
          { name: "Paper", value: "paper" },
          { name: "Scissors", value: "scissors" }
        )
    ),

  // Extra commands
  new SlashCommandBuilder()
    .setName("dwayne-github")
    .setDescription("Takes you to Dwayne's GitHub"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("⏳ Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log("✅ Slash commands registered successfully!");
  } catch (error) {
    console.log(`❌ Error registering commands: ${error}`);
  }
})();

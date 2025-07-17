require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  // API commands
  {
    name: "get-weather",
    description: "Gets the current weather for a location",
    options: [
      {
        name: "location",
        description: "The location to get the weather for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "units",
        description: "The units for the temperature",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "Celsius",
            value: "metric",
          },
          {
            name: "Fahrenheit",
            value: "imperial",
          },
        ],
      },
    ],
  },
  {
    name: "currency-convert",
    description: "Converts an amount from one currency to another",
    options: [
      {
        name: "amount",
        description: "The amount to convert",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
      {
        name: "from_currency",
        description: "The currency to convert from",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "to_currency",
        description: "The currency to convert to",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  // Moderation commands
  {
    name: "expunge-message",
    description:
      "Deletes a specified amount of the latest messages from a channel",
    options: [
      {
        name: "amount",
        description: "The number of messages to delete",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
        max_value: 100,
      },
      {
        name: "channel",
        description: "The channel to delete messages from",
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
    ],
  },
  {
    name: "kick-user",
    description: "Kicks a user from the server",
    options: [
      {
        name: "user",
        description: "The user to kick",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "The reason for kicking the user",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: "ban-user",
    description: "Bans a user from the server",
    options: [
      {
        name: "user",
        description: "The user to ban",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "The reason for banning the user",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  // Mini Games
  {
    name: "flip-coin",
    description: "Flips a coin and returns heads or tails",
  },
  {
    name: "dice-roll",
    description: "Rolls a dice and returns a number between 1 and 6",
  },
  {
    name: "rock-paper-scissors",
    description: "Play rock-paper-scissors with the bot",
    options: [
      {
        name: "choice",
        description: "Your choice (rock, paper, or scissors)",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Rock", value: "rock" },
          { name: "Paper", value: "paper" },
          { name: "Scissors", value: "scissors" },
        ],
      },
    ],
  },

  // Extra commands
  {
    name: "dwayne-github",
    description: "Takes you to Dwayne's GitHub",
  },
];

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

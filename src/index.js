require("dotenv").config();

const { Client, IntentsBitField, EmbedBuilder, Embed } = require("discord.js");
const todaysOverview = require("./commands/todays-overview");
const getAvatar = require("./commands/get-avatar");
const setRole = require("./commands/set-role");
const createPoll = require("./commands/create-poll");
const getServerInfo = require("./commands/get-server-info");
const botUpdates = require("./commands/bot-updates");
const getWeather = require("./commands/get-weather");
const currencyConvert = require("./commands/currency-convert");
const expungeMessage = require("./commands/expunge-message");
const kickUser = require("./commands/kick-user");
const banUser = require("./commands/ban-user");
const muteUser = require("./commands/mute-user");
const badWordFilter = require("./commands/bad-word-filter");
const setSlowmode = require("./commands/set-slowmode");
const setNickname = require("./commands/set-nickname");
const flipCoin = require("./commands/flip-coin");
const diceRoll = require("./commands/dice-roll");
const rockPaperScissors = require("./commands/rock-paper-scissors");
const dwayneGithub = require("./commands/dwayne-github");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online successfully!`);
});

// client.on("messageCreate", (message) => {
//   if (message.author.bot) {
//     return;
//   }

//   if (message.channel.id === "978289666644127826") {
//     message.reply("https://tenor.com/view/licka-gif-14906784873940801969");
//   }
// });

// bad word filter feature
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  const filter = client.badWordFilter || [];
  if (!filter.length) return;
  const content = message.content.toLowerCase();
  for (const word of filter) {
    if (content.includes(word.toLowerCase())) {
      try {
        await message.delete();
        await message.channel.send({
          content: `HEY, <@${message.author.id}>! Watch your language! The word **${word}** is not allowed here.`,
        });
      } catch (err) {
        console.error("Failed to delete message:", err);
      }
      break;
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const commandMap = {
    "todays-overview": todaysOverview,
    "get-avatar": getAvatar,
    "set-role": setRole,
    "create-poll": createPoll,
    "get-server-info": getServerInfo,
    "bot-updates": botUpdates,
    "get-weather": getWeather,
    "currency-convert": currencyConvert,
    "expunge-message": expungeMessage,
    "kick-user": kickUser,
    "ban-user": banUser,
    "mute-user": muteUser,
    "bad-word-filter": badWordFilter,
    "set-slowmode": setSlowmode,
    "set-nickname": setNickname,
    "flip-coin": flipCoin,
    "dice-roll": diceRoll,
    "rock-paper-scissors": rockPaperScissors,
    "dwayne-github": dwayneGithub,
  };

  const command = commandMap[interaction.commandName];
  if (!command) {
    await interaction.reply({ content: "Unknown command.", ephemeral: true });
    return;
  }
  try {
    await command(interaction, client);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content: "There was an error executing this command.",
      });
    } else {
      await interaction.reply({
        content: "There was an error executing this command.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);

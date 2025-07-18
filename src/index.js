require("dotenv").config();
const { Client, IntentsBitField, EmbedBuilder, Embed } = require("discord.js");

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
client.on("messageCreate", (message) => {
  if (message.author.bot || !message.guild) return;

  const filter = client.badWordFilter || [];

  for (const word of filter) {
    if (message.content.toLowerCase().includes(word.toLowerCase())) {
      message.delete().catch(console.error);
      message.channel
        .send({
          content: `⚠️ ${message.author}, watch your language.`,
          ephemeral: false,
        })
        .then((msg) => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
      break;
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Server utility commands
  if (interaction.commandName === "todays-overview") {
    await interaction.deferReply({});

    function getGreeting() {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    }

    // Weather fetch function
    const getWeather = async (city) => {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_API_KEY}`
      );
      const data = await res.json();

      if (data.cod !== 200) throw new Error("Failed to fetch weather");

      return {
        temp: data.main.temp,
        desc: data.weather[0].description,
        location: data.name,
      };
    };

    // News fetch function
    const getNews = async () => {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=south+africa&sortBy=publishedAt&pageSize=3&apiKey=${process.env.NEWS_API_KEY}`
      );
      const data = await res.json();

      if (data.status !== "ok") throw new Error("Failed to fetch news");

      return data.articles.map((a) => ({
        title: a.title,
        source: a.source.name,
        url: a.url,
      }));
    };

    const user = interaction.user.username;

    const embed = new EmbedBuilder()
      .setColor("#40a02b")
      .setTimestamp()
      .setTitle(`${getGreeting()} ${user} 👋`);

    try {
      const weather = await getWeather("Port Elizabeth");
      const news = await getNews().catch((err) => {
        console.error("❌ News fetch failed:", err);
        return [];
      });

      embed.setDescription(
        `Here's your daily overview for today:\n\n` +
          `**🌤 Weather Report**\n` +
          `📍 **Location:** ${weather.location}\n` +
          `🌡️ **Temperature:** ${weather.temp}°C\n` +
          `☁️ **Condition:** ${weather.desc}\n\n`
      );

      if (news.length > 0) {
        embed.addFields({
          name: "📰 Top News Headlines",
          value: news
            .map(
              (article, i) =>
                `**${i + 1}.** [${article.title}](${article.url})\n*${
                  article.source
                }*\n`
            )
            .join("\n"),
        });
      } else {
        embed.addFields({
          name: "📰 Top News Headlines",
          value: "_No news headlines found for today._",
        });
      }

      embed.setFooter({
        text: "Powered by OpenWeather and NewsAPI",
      });
    } catch (err) {
      console.error("❌ Overview error:", err);
      embed.setDescription(
        "⚠️ Couldn't fetch today's overview. Try again later."
      );
    }

    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === "get-avatar") {
    await interaction.deferReply({});

    const user = interaction.options.getUser("user");
    if (!user) {
      await interaction.editReply(
        "⚠️ Please specify a user to get the avatar of."
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 512, dynamic: true }))
      .setColor("#179299");

    await interaction.editReply({ embeds: [embed] });
  }

  // API commands
  if (interaction.commandName === "get-weather") {
    const location = interaction.options.getString("location");
    const units = interaction.options.getString("units");

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${process.env.WEATHER_API_KEY}`;

    try {
      await interaction.deferReply();

      const response = await fetch(url);
      if (!response.ok) {
        await interaction.reply("⚠️ Weather data not found for that location.");
        return;
      }

      const data = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(`🌤️ Weather in ${data.name}`)
        .setDescription(`**Current Temperature:** ${data.main.temp}°`)
        .setColor("#ea76cb")
        .addFields(
          { name: "Humidity", value: `${data.main.humidity}%`, inline: true },
          { name: "Wind Speed", value: `${data.wind.speed} m/s`, inline: true }
        )
        .setFooter({
          text: "Powered by OpenWeather",
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`❌ Error fetching weather data: ${error}`);
      await interaction.reply(
        "❌ An error occurred while fetching the weather data."
      );
    }
  }

  if (interaction.commandName === "currency-convert") {
    const amount = interaction.options.getNumber("amount");
    const fromCurrency = interaction.options
      .getString("from_currency")
      .toUpperCase();
    const toCurrency = interaction.options
      .getString("to_currency")
      .toUpperCase();

    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

    try {
      await interaction.deferReply();

      const response = await fetch(url);
      if (!response.ok) {
        await interaction.reply("⚠️ Currency data not found.");
        return;
      }

      const data = await response.json();
      const rate = data.rates[toCurrency];

      if (!rate) {
        await interaction.reply("⚠️ Invalid currency conversion.");
        return;
      }

      const convertedAmount = (amount * rate).toFixed(2);

      const embed = new EmbedBuilder()
        .setTitle("💵 Currency Conversion")
        .setDescription(
          `${amount} ${fromCurrency} is equal to ${convertedAmount} ${toCurrency}.`
        )
        .setColor("#e64553")
        .setFooter({ text: "Powered by ExchangeRate-API" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`❌ Error fetching currency data: ${error}`);
      await interaction.reply(
        "❌ An error occurred while fetching the currency data."
      );
    }
  }

  // Moderation commands
  if (interaction.commandName === "expunge-message") {
    await interaction.deferReply({ flags: "Ephemeral" });
    const amount = interaction.options.getInteger("amount");
    const channel = interaction.options.getChannel("channel");

    if (!channel.isTextBased()) {
      await interaction.editReply("⚠️ Please select a valid text channel.");
      return;
    }

    if (amount < 1 || amount > 100) {
      await interaction.editReply(
        "⚠️ You must specify between 1 and 100 messages to delete."
      );
      return;
    }

    try {
      const messages = await channel.messages.fetch({ limit: amount });

      const deleted = await channel.bulkDelete(messages, true);

      await interaction.editReply(
        `✅ Successfully deleted ${deleted.size} messages from ${channel}.`
      );
    } catch (error) {
      console.error(`❌ Error deleting messages: ${error}`);
      await interaction.editReply({
        content: "❌ An error occurred while deleting messages.",
        flags: "Ephemeral",
      });
    }
  }

  if (interaction.commandName === "kick-user") {
    await interaction.deferReply({ flags: "Ephemeral" });

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    if (!user) {
      await interaction.editReply("⚠️ Please specify a user to kick.");
      return;
    }

    if (!reason) {
      await interaction.editReply("⚠️ Please provide a reason for the kick.");
      return;
    }

    try {
      const member =
        interaction.guild.members.cache.get(user.id) ??
        (await interaction.guild.members.fetch(user.id).catch(() => null));

      console.log("Command executed by:", interaction.user.tag);
      console.log("User to kick:", user.tag, user.id);
      console.log("Guild ID:", interaction.guild.id);
      console.log("Member object:", member);

      if (!member) {
        await interaction.editReply("⚠️ That user is not in this server.");
        return;
      }

      if (!member.kickable) {
        await interaction.editReply(
          "⚠️ I can't kick this user. They might have a higher role or I lack permissions."
        );
        return;
      }

      await member.kick(reason);
      await interaction.editReply(
        `✅ Successfully kicked **${user.tag}** from the server.`
      );
    } catch (error) {
      console.error(`❌ Error kicking user: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to kick the user."
      );
    }
  }

  if (interaction.commandName === "ban-user") {
    await interaction.deferReply({ flags: "Ephemeral" });

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    if (!user) {
      await interaction.editReply("⚠️ Please specify a user to ban.");
      return;
    }

    if (!reason) {
      await interaction.editReply("⚠️ Please provide a reason for the ban.");
      return;
    }

    try {
      const member =
        interaction.guild.members.cache.get(user.id) ??
        (await interaction.guild.members.fetch(user.id).catch(() => null));

      console.log("Command executed by:", interaction.user.tag);
      console.log("User to ban:", user.tag, user.id);
      console.log("Guild ID:", interaction.guild.id);
      console.log("Member object:", member);

      if (!member) {
        await interaction.editReply("⚠️ That user is not in this server.");
        return;
      }

      if (!member.bannable) {
        await interaction.editReply(
          "⚠️ I can't ban this user. They might have a higher role or I lack permissions."
        );
        return;
      }

      await member.ban({ reason });
      await interaction.editReply(
        `✅ Successfully banned **${user.tag}** from the server.`
      );
    } catch (error) {
      console.error(`❌ Error banning user: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to ban the user."
      );
    }
  }

  if (interaction.commandName === "mute-user") {
    await interaction.deferReply({ flags: "Ephemeral" });

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");

    if (!user) {
      await interaction.editReply("⚠️ Please specify a user to mute.");
      return;
    }

    if (!duration || duration < 1) {
      await interaction.editReply(
        "⚠️ Please provide a valid duration in seconds."
      );
      return;
    }

    try {
      const member =
        interaction.guild.members.cache.get(user.id) ??
        (await interaction.guild.members.fetch(user.id).catch(() => null));

      console.log("Command executed by:", interaction.user.tag);
      console.log("User to mute:", user.tag, user.id);
      console.log("Guild ID:", interaction.guild.id);
      console.log("Member object:", member);

      if (!member) {
        await interaction.editReply("⚠️ That user is not in this server.");
        return;
      }

      if (!member.moderatable) {
        await interaction.editReply(
          "⚠️ I can't mute this user. They might have a higher role or I lack permissions."
        );
        return;
      }

      await member.timeout(duration * 1000);
      await interaction.editReply(
        `✅ Successfully muted **${user.tag}** for ${duration} seconds.`
      );
    } catch (error) {
      console.error(`❌ Error muting user: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to mute the user."
      );
    }
  }

  if (interaction.commandName === "bad-word-filter") {
    await interaction.deferReply({ flags: "Ephemeral" });

    const toggle = interaction.options.getBoolean("toggle");
    const word = interaction.options.getString("word");

    if (toggle === null) {
      await interaction.editReply(
        "⚠️ Please specify whether to enable or disable the filter."
      );
      return;
    }

    if (!word) {
      await interaction.editReply("⚠️ Please provide a word to filter.");
      return;
    }

    try {
      const filter = client.badWordFilter || [];
      if (toggle) {
        if (!filter.includes(word)) {
          filter.push(word);
          client.badWordFilter = filter;
          await interaction.editReply(
            `✅ Bad word filter enabled. Filtering out: **${word}**`
          );
        } else {
          await interaction.editReply(
            "⚠️ This word is already in the bad word filter."
          );
        }
      } else {
        const index = filter.indexOf(word);
        if (index > -1) {
          filter.splice(index, 1);
          client.badWordFilter = filter;
          await interaction.editReply(
            `✅ Bad word filter disabled for: **${word}**`
          );
        } else {
          await interaction.editReply(
            "⚠️ This word is not in the bad word filter."
          );
        }
      }
    } catch (error) {
      console.error(`❌ Error toggling bad word filter: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to toggle the bad word filter."
      );
      return;
    }
  }

  // Mini Games
  if (interaction.commandName === "flip-coin") {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    const embed = new EmbedBuilder()
      .setTitle("🪙 Coin Flip Result")
      .setDescription(`The coin landed on: **${result}**`)
      .setColor("#8839ef")
      .setFooter({ text: "Coin Flip Game" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "dice-roll") {
    const result = Math.floor(Math.random() * 6) + 1;

    const embed = new EmbedBuilder()
      .setTitle("🎲 Dice Roll Result")
      .setDescription(`You rolled a **${result}**`)
      .setColor("#d20f39")
      .setFooter({ text: "Dice Roll Game" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "rock-paper-scissors") {
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
  }

  // Extra commands
  if (interaction.commandName === "dwayne-github") {
    await interaction.deferReply({});
    const embed = new EmbedBuilder()
      .setTitle("Dwayne's GitHub")
      .setDescription(
        "Click [here](https://github.com/DwayneCrous) to visit Dwayne's GitHub profile!"
      )
      .setColor("#df8e1d")
      .setFooter({ text: "Dwayne's GitHub" });

    await interaction.editReply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);

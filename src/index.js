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

  if (interaction.commandName === "set-role") {
    await interaction.deferReply({ flags: "Ephemeral" });

    const role = interaction.options.getRole("role");
    const user = interaction.options.getUser("member");
    if (!role || !user) {
      await interaction.editReply(
        "⚠️ Please specify both a role and a member to assign the role to."
      );
      return;
    }

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);
    if (!member) {
      await interaction.editReply(
        "⚠️ Could not find that member in this server."
      );
      return;
    }

    try {
      await member.roles.add(role);
      await interaction.editReply(
        `✅ Successfully assigned the role **${role.name}** to ${user.username}.`
      );
    } catch (error) {
      console.error(`❌ Error assigning role: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to assign the role."
      );
    }
  }

  if (interaction.commandName === "create-poll") {
    await interaction.deferReply({});

    const question = interaction.options.getString("question");
    const option1 = interaction.options.getString("option1");
    const option2 = interaction.options.getString("option2");
    const duration = interaction.options.getInteger("duration");

    if (!question || !option1 || !option2 || !duration) {
      await interaction.editReply(
        "⚠️ Please provide a question, two options, and a duration (in minutes) for the poll."
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Poll: ${question}`)
      .setDescription(`🟩 ${option1}\n🟦 ${option2}`)
      .setColor("#179299")
      .setFooter({
        text: `React with 🟩 or 🟦 to vote! Poll ends in ${duration} minute${
          duration === 1 ? "" : "s"
        }.`,
      });

    const pollMessage = await interaction.editReply({
      embeds: [embed],
      fetchReply: true,
    });

    await pollMessage.react("🟩");
    await pollMessage.react("🟦");

    setTimeout(async () => {
      try {
        const fetchedMsg = await interaction.channel.messages.fetch(
          pollMessage.id
        );
        const greenReaction = fetchedMsg.reactions.cache.get("🟩");
        const blueReaction = fetchedMsg.reactions.cache.get("🟦");

        const greenUsers = greenReaction
          ? await greenReaction.users.fetch()
          : new Map();
        const blueUsers = blueReaction
          ? await blueReaction.users.fetch()
          : new Map();

        const greenVotes = greenUsers.filter((user) => !user.bot).size;
        const blueVotes = blueUsers.filter((user) => !user.bot).size;

        let resultMsg;
        if (greenVotes > blueVotes) {
          resultMsg = `🟩 **${option1}** wins with ${greenVotes} votes!`;
        } else if (blueVotes > greenVotes) {
          resultMsg = `🟦 **${option2}** wins with ${blueVotes} votes!`;
        } else {
          resultMsg = `It's a tie! Both options received ${greenVotes} votes.`;
        }

        await interaction.followUp({
          content: `⏰ Poll ended!\n${resultMsg}`,
          ephemeral: false,
        });
      } catch (err) {
        console.error("❌ Error ending poll:", err);
      }
    }, duration * 60 * 1000);
  }

  if (interaction.commandName === "get-server-info") {
    await interaction.deferReply({});

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply(
        "⚠️ This command can only be used in a server."
      );
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`Server Info: ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 512, dynamic: true }))
      .setColor("#04a5e5")
      .addFields(
        { name: "Server ID", value: guild.id, inline: true },
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "Member Count", value: `${guild.memberCount}`, inline: true },
        {
          name: "Created At",
          value: guild.createdAt.toDateString(),
          inline: true,
        }
      )
      .setFooter({ text: "Server Information" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  // Bot utility commands
  if (interaction.commandName === "bot-updates") {
    await interaction.deferReply({ flags: "Ephemeral" });

    let updateMessage = interaction.options.getString("update") || "";

    const buildEmbed = (desc) =>
      new EmbedBuilder()
        .setTitle("🥳 New Features added!")
        .setDescription(desc)
        .setColor("#04a5e5")
        .setFooter({ text: "Bot Updates" });

    const {
      ActionRowBuilder,
      ButtonBuilder,
      ButtonStyle,
      ModalBuilder,
      TextInputBuilder,
      TextInputStyle,
    } = require("discord.js");

    const previewEmbed = buildEmbed(
      updateMessage || "_No update message provided yet._"
    );
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("botupdates_send")
        .setLabel("Send to Server")
        .setStyle(ButtonStyle.Success)
        .setDisabled(!updateMessage),
      new ButtonBuilder()
        .setCustomId("botupdates_edit")
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      content: "Here is your update preview. You can edit or send it:",
      embeds: [previewEmbed],
      components: [row],
      Ephemeral: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 5 * 60 * 1000,
      componentType: 2,
    });

    collector.on("collect", async (btnInt) => {
      if (btnInt.customId === "botupdates_edit") {
        const modal = new ModalBuilder()
          .setCustomId("botupdates_modal")
          .setTitle("Edit Bot Update");
        const input = new TextInputBuilder()
          .setCustomId("botupdates_input")
          .setLabel("Update Message")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1024)
          .setValue(updateMessage);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await btnInt.showModal(modal);
      } else if (btnInt.customId === "botupdates_send") {
        // Send to the channel where the command was run
        if (!interaction.channel || !interaction.channel.isTextBased()) {
          await btnInt.reply({
            content: "❌ Could not send update: this is not a text channel.",
            ephemeral: true,
          });
          return;
        }
        await interaction.channel.send({
          content: "@here",
          embeds: [buildEmbed(updateMessage)],
        });
        await btnInt.reply({
          content: "✅ Update sent to the server!",
          flags: "Ephemeral",
        });
        collector.stop();
      }
    });

    client.on("interactionCreate", async (modalInt) => {
      if (!modalInt.isModalSubmit()) return;
      if (modalInt.customId !== "botupdates_modal") return;
      if (modalInt.user.id !== interaction.user.id) return;
      updateMessage = modalInt.fields.getTextInputValue("botupdates_input");

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("botupdates_send")
          .setLabel("Send to Server")
          .setStyle(ButtonStyle.Success)
          .setDisabled(!updateMessage),
        new ButtonBuilder()
          .setCustomId("botupdates_edit")
          .setLabel("Edit")
          .setStyle(ButtonStyle.Primary)
      );
      await modalInt.update({
        content: "Here is your update preview. You can edit or send it:",
        embeds: [buildEmbed(updateMessage)],
        components: [newRow],
        Ephemeral: true,
      });
    });
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

  if (interaction.commandName === "set-slowmode") {
    await interaction.deferReply({});

    const channel = interaction.options.getChannel("channel");
    const duration = interaction.options.getInteger("duration");

    if (!channel.isTextBased()) {
      await interaction.editReply("⚠️ Please select a valid text channel.");
      return;
    }

    if (duration < 0) {
      await interaction.editReply(
        "⚠️ Please provide a valid duration in seconds (0 or more)."
      );
      return;
    }

    try {
      await channel.setRateLimitPerUser(duration);
      await interaction.editReply(
        `✅ Successfully set slowmode for **${channel.name}** to ${duration} seconds.`
      );
    } catch (error) {
      console.error(`❌ Error setting slowmode: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to set slowmode."
      );
    }
  }

  if (interaction.commandName === "set-nickname") {
    await interaction.deferReply({});

    const user = interaction.options.getUser("user");
    const nickname = interaction.options.getString("nickname");

    if (!user) {
      await interaction.editReply(
        "⚠️ Please specify a user to set the nickname for."
      );
      return;
    }

    if (!nickname) {
      await interaction.editReply("⚠️ Please provide a new nickname.");
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.setNickname(nickname);
      await interaction.editReply(
        `✅ Successfully set the nickname for **${user.tag}** to **${nickname}**.`
      );
    } catch (error) {
      console.error(`❌ Error setting nickname: ${error}`);
      await interaction.editReply(
        "❌ An error occurred while trying to set the nickname."
      );
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

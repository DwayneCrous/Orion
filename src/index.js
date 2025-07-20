require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const remindersPath = path.join(__dirname, "../data/reminders.json");
function loadRemindersOnStartup(client) {
  if (!fs.existsSync(remindersPath)) return;
  let reminders = [];
  try {
    const raw = fs.readFileSync(remindersPath, "utf8");
    reminders = JSON.parse(raw);
  } catch (err) {
    reminders = [];
  }
  const now = Date.now();
  reminders.forEach((reminder) => {
    const delay = reminder.remindAt - now;
    if (delay <= 0) {
      const channel = client.channels.cache.get(reminder.channelId);
      if (channel) {
        channel.send(`<@${reminder.userId}> 🔔 Reminder: ${reminder.message}`);
      }
    } else {
      setTimeout(() => {
        const channel = client.channels.cache.get(reminder.channelId);
        if (channel) {
          channel.send(
            `<@${reminder.userId}> 🔔 Reminder: ${reminder.message}`
          );
        }

        let reminders = [];
        try {
          const raw = fs.readFileSync(remindersPath, "utf8");
          reminders = JSON.parse(raw);
        } catch (err) {}
        reminders = reminders.filter(
          (r) =>
            r.remindAt !== reminder.remindAt || r.userId !== reminder.userId
        );
        fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));
      }, delay);
    }
  });
}
const {
  Client,
  Collection,
  IntentsBitField,
  Events,
  MessageFlags,
} = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online successfully!`);
  loadRemindersOnStartup(client);

  const fs = require("fs");
  const path = require("path");
  const dataDir = path.join(__dirname, "../data");
  const birthdaysPath = path.join(dataDir, "birthdays.json");
  const channelId = process.env.BIRTHDAY_CHANNEL_ID;

  const checkBirthdays = async () => {
    if (!fs.existsSync(birthdaysPath)) return;
    let birthdays = {};
    try {
      const raw = fs.readFileSync(birthdaysPath, "utf8");
      birthdays = JSON.parse(raw);
    } catch (err) {
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().slice(5, 10);
    const birthdayUsers = Object.entries(birthdays)
      .filter(([_, date]) => {
        const parts = date.split(/[-\/]/);
        if (parts.length !== 3) return false;
        return `${parts[1]}-${parts[2]}` === todayStr;
      })
      .map(([userId]) => `<@${userId}>`);

    if (birthdayUsers.length > 0 && channelId) {
      const channel = c.channels.cache.get(channelId);
      if (channel) {
        channel.send(
          `🎉 Happy Birthday ${birthdayUsers.join(
            ", "
          )}! Have a fantastic day! 🎂`
        );
      }
    }
  };

  const now = new Date();
  const next9am = new Date(now);
  next9am.setHours(9, 0, 0, 0);
  if (now > next9am) next9am.setDate(next9am.getDate() + 1);
  const msUntil9am = next9am - now;

  setTimeout(() => {
    checkBirthdays();
    setInterval(checkBirthdays, 24 * 60 * 60 * 1000);
  }, msUntil9am);
});

client.on(Events.GuildMemberAdd, async (member) => {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  try {
    await channel.send({
      embeds: [
        {
          title: "Welcome!",
          description: `We're glad to have you here, <@${member.id}>!`,
          color: 0x209fb5,
          thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
          },
          fields: [
            {
              name: "User",
              value: `<@${member.id}>`,
              inline: true,
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("Failed to send welcome message:", err);
  }
});

// client.on("messageCreate", (message) => {
//   if (message.author.bot) {
//     return;
//   }

//   if (message.channel.id === "978289666644127826") {
//     message.reply("https://tenor.com/view/licka-gif-14906784873940801969");
//   }
// });

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  let member;
  try {
    member = await message.guild.members.fetch(message.author.id);
  } catch {
    return;
  }
  const presence = member.presence;
  if (!presence) return;
  const status = presence.status;
  if (["offline", "idle", "dnd"].includes(status)) {
    await message.reply(
      "https://cdn.discordapp.com/attachments/1269017675544268852/1396456663027941497/5ltbz8.png?ex=687e271d&is=687cd59d&hm=1fccf934b7ff80b5b9392191bdc659b286ae723b73158464109241a84f5ed613&"
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(process.env.TOKEN);

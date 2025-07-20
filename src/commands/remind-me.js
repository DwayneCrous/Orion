const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remind-me")
    .setDescription("Set a reminder for yourself.")
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription(
          'Time duration for the reminder (e.g., "10m", "1h", "2d")'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message for the reminder")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: "Ephemeral" });

    const timeInput = interaction.options.getString("time");
    const message = interaction.options.getString("message");

    const timeRegex = /^(\d+)([smhd])$/;
    const match = timeInput.match(timeRegex);
    if (!match) {
      await interaction.editReply(
        '⚠️ Invalid time format. Use "10m", "1h", or "2d".'
      );
      return;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    let milliseconds;

    switch (unit) {
      case "s":
        milliseconds = value * 1000;
        break;
      case "m":
        milliseconds = value * 60 * 1000;
        break;
      case "h":
        milliseconds = value * 60 * 60 * 1000;
        break;
      case "d":
        milliseconds = value * 24 * 60 * 60 * 1000;
        break;
      default:
        await interaction.editReply(
          '⚠️ Invalid time unit. Use "s", "m", "h", or "d".'
        );
        return;
    }

    const fs = require("fs");
    const path = require("path");
    const dataDir = path.join(__dirname, "../../data");
    const remindersPath = path.join(dataDir, "reminders.json");

    let reminders = [];
    if (fs.existsSync(remindersPath)) {
      try {
        const raw = fs.readFileSync(remindersPath, "utf8");
        reminders = JSON.parse(raw);
      } catch (err) {
        reminders = [];
      }
    }

    const remindAt = Date.now() + milliseconds;
    const reminder = {
      userId: interaction.user.id,
      channelId: interaction.channelId,
      message,
      remindAt,
      timeInput,
    };
    reminders.push(reminder);
    fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));

    setTimeout(() => {
      interaction.followUp(`🔔 Reminder: ${message}`);

      let updatedReminders = reminders.filter((r) => r !== reminder);
      fs.writeFileSync(
        remindersPath,
        JSON.stringify(updatedReminders, null, 2)
      );
    }, milliseconds);

    await interaction.editReply(
      `✅ Reminder set for ${timeInput}. I will remind you: "${message}"`
    );
  },
};

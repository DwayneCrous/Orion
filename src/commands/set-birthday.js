const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-birthday")
    .setDescription("Set your birthday")
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Enter your birthday (YYYY-MM-DD)")
        .setRequired(true)
    ),
  async execute(interaction) {
    const date = interaction.options.getString("date");

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      await interaction.reply({
        content: "Invalid date format. Please use YYYY-MM-DD.",
        ephemeral: true,
      });
      return;
    }

    const fs = require("fs");
    const path = require("path");
    const dataDir = path.join(__dirname, "../../data");
    const birthdaysPath = path.join(dataDir, "birthdays.json");

    let birthdays = {};
    if (fs.existsSync(birthdaysPath)) {
      try {
        const raw = fs.readFileSync(birthdaysPath, "utf8");
        birthdays = JSON.parse(raw);
      } catch (err) {
        birthdays = {};
      }
    }

    birthdays[interaction.user.id] = date;
    fs.writeFileSync(birthdaysPath, JSON.stringify(birthdays, null, 2));

    await interaction.reply(`Your birthday has been set to ${date}`);
  },
};

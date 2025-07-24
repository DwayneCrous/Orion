const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-birthdays")
    .setDescription("List all user birthdays"),
  async execute(interaction) {
    const dataDir = path.join(__dirname, "../../data");
    const birthdaysPath = path.join(dataDir, "birthdays.json");

    if (!fs.existsSync(birthdaysPath)) {
      await interaction.reply("No birthdays have been set yet.");
      return;
    }

    let birthdays = {};
    try {
      const raw = fs.readFileSync(birthdaysPath, "utf8");
      birthdays = JSON.parse(raw);
    } catch (err) {
      await interaction.reply("Could not read birthdays data.");
      return;
    }

    const entries = Object.entries(birthdays);
    if (entries.length === 0) {
      await interaction.reply("No birthdays have been set yet.");
      return;
    }

    const lines = await Promise.all(
      entries.map(async ([userId, date]) => {
        try {
          const member = await interaction.guild.members.fetch(userId);
          return `${member.user.username}: ${date}`;
        } catch {
          return `Unknown User (${userId}): ${date}`;
        }
      })
    );
    const message = `**Birthdays:**\n` + lines.join("\n");
    await interaction.reply(message);
  },
};

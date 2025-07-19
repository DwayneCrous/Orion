const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-weather")
    .setDescription("Get the current weather for a location.")
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("Location to get weather for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("units")
        .setDescription("Units")
        .setRequired(true)
        .addChoices(
          { name: "Celsius", value: "metric" },
          { name: "Fahrenheit", value: "imperial" }
        )
    ),
  async execute(interaction) {
    const location = interaction.options.getString("location");
    const units = interaction.options.getString("units");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${process.env.WEATHER_API_KEY}`;
    try {
      await interaction.deferReply();
      const response = await fetch(url);
      if (!response.ok) {
        await interaction.editReply(
          "⚠️ Weather data not found for that location."
        );
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
      await interaction.editReply(
        "❌ An error occurred while fetching the weather data."
      );
    }
  },
};

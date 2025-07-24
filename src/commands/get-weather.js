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
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${process.env.WEATHER_API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${units}&appid=${process.env.WEATHER_API_KEY}`;
    try {
      await interaction.deferReply();
      // Fetch current weather
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        await interaction.editReply(
          "⚠️ Weather data not found for that location."
        );
        return;
      }
      const weatherData = await weatherResponse.json();

      // Fetch forecast data
      const forecastResponse = await fetch(forecastUrl);
      let forecastField = {
        name: "Forecast",
        value: "No forecast data available.",
        inline: false,
      };
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();

        const today = new Date();
        const todayDateStr = today.toISOString().slice(0, 10);

        const todayForecast = forecastData.list.filter((item) =>
          item.dt_txt.startsWith(todayDateStr)
        );
        if (todayForecast.length > 0) {
          // Show up to 8 intervals (24 hours, 3-hour steps)
          const hourlyTemps = todayForecast.map((item) => {
            const hour = new Date(item.dt_txt)
              .getHours()
              .toString()
              .padStart(2, "0");
            return `${hour}:00 - ${item.main.temp}°`;
          });
          forecastField = {
            name: "Today's Hourly Forecast",
            value: hourlyTemps.join(" | "),
            inline: false,
          };
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`🌤️ Weather in ${weatherData.name}`)
        .setDescription(`**Current Temperature:** ${weatherData.main.temp}°`)
        .setColor("#ea76cb")
        .addFields(
          {
            name: "Humidity",
            value: `${weatherData.main.humidity}%`,
            inline: true,
          },
          {
            name: "Wind Speed",
            value: `${weatherData.wind.speed} m/s`,
            inline: true,
          },
          forecastField
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

const { EmbedBuilder } = require("discord.js");

module.exports = async function getWeather(interaction) {
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
};

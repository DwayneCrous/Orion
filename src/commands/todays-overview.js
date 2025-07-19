const { EmbedBuilder } = require("discord.js");

module.exports = async function todaysOverview(interaction) {
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
};

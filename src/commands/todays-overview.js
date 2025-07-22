const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todays-overview")
    .setDescription("Get a summary of today's weather and news for a city."),

  async execute(interaction) {
    await interaction.deferReply();
    function getGreeting() {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    }

    const getTodaysForecast = async (city) => {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${process.env.WEATHER_API_KEY}`
      );
      const data = await res.json();
      if (data.cod !== "200") throw new Error("Failed to fetch forecast");
      const today = new Date().toISOString().slice(0, 10);
      const intervals = data.list.filter((item) =>
        item.dt_txt.startsWith(today)
      );
      if (!intervals.length) throw new Error("No forecast data for today");

      const temps = intervals.map((i) => i.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      const descCounts = {};
      intervals.forEach((i) => {
        const desc = i.weather[0].description;
        descCounts[desc] = (descCounts[desc] || 0) + 1;
      });
      const mostCommonDesc = Object.entries(descCounts).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
      return {
        location: data.city.name,
        minTemp,
        maxTemp,
        intervals,
        desc: mostCommonDesc,
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
      const forecast = await getTodaysForecast("Port Elizabeth");
      let geminiSummary = "";
      try {
        const geminiPrompt = `Given the following weather forecast data for Port Elizabeth, 
                              South Africa, write a short and sweet paragraph describing the 
                              weather for the day, what activities would be nice, whether to 
                              stay inside, sort of like jarvis does when tony stark wakes up 
                              and jarvis gives him the overview. You don't have to address me
                              as sir or ma'am, you can just go straight to the overview, also
                              don't say good morning or good evening or afternoon.\nForecast data: ${JSON.stringify(
                                forecast.intervals
                              )}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: geminiPrompt,
        });
        geminiSummary = response.text || "";
      } catch (err) {
        console.error("❌ Gemini summary failed:", err);
      }
      const news = await getNews().catch((err) => {
        console.error("❌ News fetch failed:", err);
        return [];
      });
      embed.setDescription(
        `Here's your daily overview for today:\n\n` +
          (geminiSummary
            ? `**🤖 Gemini's Weather Overview:**\n${geminiSummary}\n\n`
            : "") +
          `**🌤 Weather Report**\n` +
          `📍 **Location:** ${forecast.location}\n` +
          `🌡️ **Min/Max Temperature:** ${forecast.minTemp.toFixed(
            1
          )}°C / ${forecast.maxTemp.toFixed(1)}°C\n` +
          `☁️ **Condition:** ${forecast.desc}\n\n`
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
        text: "Powered by OpenWeather, NewsAPI & Gemini",
      });
    } catch (err) {
      console.error("❌ Overview error:", err);
      embed.setDescription(
        "⚠️ Couldn't fetch today's overview. Try again later."
      );
    }
    await interaction.editReply({ embeds: [embed] });
  },
};

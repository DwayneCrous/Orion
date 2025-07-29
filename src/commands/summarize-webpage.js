const { SlashCommandBuilder } = require("discord.js");

const puppeteer = require("puppeteer");

// Use Gemini API for summarization
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_FLASH_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summarize-webpage")
    .setDescription(
      "Summarizes a webpage into a short, condensed paragraph using AI."
    )
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The URL of the webpage to summarize")
        .setRequired(true)
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    await interaction.deferReply();

    if (!/^https?:\/\/.+/.test(url)) {
      await interaction.editReply(
        "❌ Invalid URL. Please provide a valid URL starting with http or https."
      );
      return;
    }
    try {
      // Fetch webpage content using Puppeteer
      let html;
      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        );
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        html = await page.content();
        await browser.close();
      } catch (err) {
        await interaction.editReply(
          `❌ Puppeteer error while fetching the webpage: ${err.message}. The site may block bots, require login, or be temporarily unavailable.`
        );
        return;
      }

      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const prompt = `Summarize the following webpage content in one short, condensed paragraph:\n${text.slice(
        0,
        4000
      )}`;

      let geminiData;
      try {
        const geminiRes = await fetch(
          `${GEMINI_FLASH_URL}?key=${GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          }
        );
        if (!geminiRes.ok) {
          await interaction.editReply(
            `❌ Gemini API error: HTTP status ${geminiRes.status} ${geminiRes.statusText}. Check your API key and quota.`
          );
          return;
        }
        geminiData = await geminiRes.json();
      } catch (err) {
        await interaction.editReply(
          `❌ Network error while contacting Gemini API: ${err.message}. Please check your API key, quota, or try again later.`
        );
        return;
      }

      let summary =
        "❌ Could not generate summary. The webpage may be too complex, empty, or blocked.";
      if (geminiData?.candidates?.length) {
        const candidate = geminiData.candidates[0];
        if (candidate?.content?.parts?.length) {
          summary = candidate.content.parts[0].text?.trim() || summary;
        }
      }

      await interaction.editReply(summary);
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        `❌ Unexpected error: ${error.message}. Please check the URL, your API key, or try again later.`
      );
    }
  },
};

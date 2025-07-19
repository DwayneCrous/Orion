const { EmbedBuilder } = require("discord.js");

module.exports = async function currencyConvert(interaction) {
  const amount = interaction.options.getNumber("amount");
  const fromCurrency = interaction.options
    .getString("from_currency")
    .toUpperCase();
  const toCurrency = interaction.options.getString("to_currency").toUpperCase();
  const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
  try {
    await interaction.deferReply();
    const response = await fetch(url);
    if (!response.ok) {
      await interaction.reply("⚠️ Currency data not found.");
      return;
    }
    const data = await response.json();
    const rate = data.rates[toCurrency];
    if (!rate) {
      await interaction.reply("⚠️ Invalid currency conversion.");
      return;
    }
    const convertedAmount = (amount * rate).toFixed(2);
    const embed = new EmbedBuilder()
      .setTitle("💵 Currency Conversion")
      .setDescription(
        `${amount} ${fromCurrency} is equal to ${convertedAmount} ${toCurrency}.`
      )
      .setColor("#e64553")
      .setFooter({ text: "Powered by ExchangeRate-API" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`❌ Error fetching currency data: ${error}`);
    await interaction.reply(
      "❌ An error occurred while fetching the currency data."
    );
  }
};

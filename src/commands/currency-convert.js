const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("currency-convert")
    .setDescription("Convert an amount from one currency to another.")
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount to convert")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("from_currency")
        .setDescription("Currency to convert from (e.g. USD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("to_currency")
        .setDescription("Currency to convert to (e.g. EUR)")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getNumber("amount");
    const fromCurrency = interaction.options
      .getString("from_currency")
      .toUpperCase();
    const toCurrency = interaction.options
      .getString("to_currency")
      .toUpperCase();
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
    try {
      await interaction.deferReply();
      const response = await fetch(url);
      if (!response.ok) {
        await interaction.editReply("⚠️ Currency data not found.");
        return;
      }
      const data = await response.json();
      const rate = data.rates[toCurrency];
      if (!rate) {
        await interaction.editReply("⚠️ Invalid currency conversion.");
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
      await interaction.editReply(
        "❌ An error occurred while fetching the currency data."
      );
    }
  },
};

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot-updates")
    .setDescription("Send or preview a bot update message.")
    .addStringOption((option) =>
      option
        .setName("update")
        .setDescription("Update message")
        .setRequired(true)
    ),
  async execute(interaction) {
    const client = interaction.client;
    await interaction.deferReply({ flags: "Ephemeral" });
    let updateMessage = interaction.options.getString("update") || "";
    const buildEmbed = (desc) =>
      new EmbedBuilder()
        .setTitle("\ud83c\udf89 New Features added!")
        .setDescription(desc)
        .setColor("#04a5e5")
        .setFooter({ text: "Bot Updates" });
    const previewEmbed = buildEmbed(
      updateMessage || "_No update message provided yet._"
    );
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("botupdates_send")
        .setLabel("Send to Server")
        .setStyle(ButtonStyle.Success)
        .setDisabled(!updateMessage),
      new ButtonBuilder()
        .setCustomId("botupdates_edit")
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary)
    );
    await interaction.editReply({
      content: "Here is your update preview. You can edit or send it:",
      embeds: [previewEmbed],
      components: [row],
      Ephemeral: true,
    });
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 5 * 60 * 1000,
      componentType: 2,
    });
    collector.on("collect", async (btnInt) => {
      if (btnInt.customId === "botupdates_edit") {
        const modal = new ModalBuilder()
          .setCustomId("botupdates_modal")
          .setTitle("Edit Bot Update");
        const input = new TextInputBuilder()
          .setCustomId("botupdates_input")
          .setLabel("Update Message")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1024)
          .setValue(updateMessage);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await btnInt.showModal(modal);
      } else if (btnInt.customId === "botupdates_send") {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
          await btnInt.reply({
            content: "❌ Could not send update: this is not a text channel.",
            ephemeral: true,
          });
          return;
        }
        await interaction.channel.send({
          content: "@here",
          embeds: [buildEmbed(updateMessage)],
        });
        await btnInt.reply({
          content: "✅ Update sent to the server!",
          flags: "Ephemeral",
        });
        collector.stop();
      }
    });
    client.on("interactionCreate", async (modalInt) => {
      if (!modalInt.isModalSubmit()) return;
      if (modalInt.customId !== "botupdates_modal") return;
      if (modalInt.user.id !== interaction.user.id) return;
      updateMessage = modalInt.fields.getTextInputValue("botupdates_input");
      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("botupdates_send")
          .setLabel("Send to Server")
          .setStyle(ButtonStyle.Success)
          .setDisabled(!updateMessage),
        new ButtonBuilder()
          .setCustomId("botupdates_edit")
          .setLabel("Edit")
          .setStyle(ButtonStyle.Primary)
      );
      await modalInt.update({
        content: "Here is your update preview. You can edit or send it:",
        embeds: [buildEmbed(updateMessage)],
        components: [newRow],
        Ephemeral: true,
      });
    });
  },
};

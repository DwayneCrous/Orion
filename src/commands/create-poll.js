const { EmbedBuilder } = require("discord.js");

module.exports = async function createPoll(interaction) {
  await interaction.deferReply({});
  const question = interaction.options.getString("question");
  const option1 = interaction.options.getString("option1");
  const option2 = interaction.options.getString("option2");
  const duration = interaction.options.getInteger("duration");
  if (!question || !option1 || !option2 || !duration) {
    await interaction.editReply(
      "⚠️ Please provide a question, two options, and a duration (in minutes) for the poll."
    );
    return;
  }
  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    if (minutes < 1440) {
      const hours = minutes / 60;
      return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hour${
        hours === 1 ? "" : "s"
      }`;
    }
    const days = minutes / 1440;
    return `${days % 1 === 0 ? days : days.toFixed(1)} day${
      days === 1 ? "" : "s"
    }`;
  }
  const embed = new EmbedBuilder()
    .setTitle(`Poll: ${question}`)
    .setDescription(`🟩 ${option1}\n🟦 ${option2}`)
    .setColor("#179299")
    .setFooter({
      text: `React with 🟩 or 🟦 to vote! Poll ends in ${formatDuration(
        duration
      )}.`,
    });
  const pollMessage = await interaction.editReply({
    embeds: [embed],
    fetchReply: true,
  });
  await pollMessage.react("🟩");
  await pollMessage.react("🟦");
  setTimeout(async () => {
    try {
      const fetchedMsg = await interaction.channel.messages.fetch(
        pollMessage.id
      );
      const greenReaction = fetchedMsg.reactions.cache.get("🟩");
      const blueReaction = fetchedMsg.reactions.cache.get("🟦");
      const greenUsers = greenReaction
        ? await greenReaction.users.fetch()
        : new Map();
      const blueUsers = blueReaction
        ? await blueReaction.users.fetch()
        : new Map();
      const greenVotes = greenUsers.filter((user) => !user.bot).size;
      const blueVotes = blueUsers.filter((user) => !user.bot).size;
      let resultMsg;
      if (greenVotes > blueVotes) {
        resultMsg = `🟩 **${option1}** wins with ${greenVotes} votes!`;
      } else if (blueVotes > greenVotes) {
        resultMsg = `🟦 **${option2}** wins with ${blueVotes} votes!`;
      } else {
        resultMsg = `It's a tie! Both options received ${greenVotes} votes.`;
      }
      await interaction.followUp({
        content: `⏰ Poll ended!\n${resultMsg}`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("❌ Error ending poll:", err);
    }
  }, duration * 60 * 1000);
};

const { SlashCommandBuilder } = require("discord.js");

const roasts = [
  "If ignorance is bliss, you must be the happiest person alive.",
  "You have the unique ability to make everyone in the room uncomfortable just by existing.",
  "If laziness was an Olympic sport, you'd win gold without even showing up.",
  "You have the personality of a broken smoke alarm: loud, annoying, and completely useless.",
  "If I wanted to hear from someone irrelevant, I'd turn on reality TV.",
  "You're the reason warning labels exist.",
  "If you were any more dense, you'd have your own gravitational pull.",
  "You have the charm of a tax audit.",
  "If you were twice as smart, you'd still be below average.",
  "You have the social skills of a dial-up modem.",
  "If I had a dollar for every brain cell you had, I'd be broke.",
  "You're the human equivalent of a software bug.",
  "If you were a vegetable, you'd be a cabbage—lifeless and bland.",
  "You have the emotional range of a teaspoon.",
  "If you were any slower, you'd be going backwards.",
  "You're the reason the phrase 'not my problem' was invented.",
  "If you were any more forgettable, you'd be a background character in your own life.",
  "You have the creativity of a blank sheet of paper.",
  "If you were any more basic, you'd be a default setting.",
  "You're the reason people double-check their locks at night.",
  "If you were any more disappointing, you'd be a sequel nobody asked for.",
  "You have the energy of a dead battery.",
  "If you were any more irrelevant, you'd be a footnote in a dictionary.",
  "You're the reason people mute group chats.",
  "If you were any more awkward, you'd be a Zoom call with no host.",
  "You have the likability of a pop-up ad.",
  "If you were any more pointless, you'd be a broken pencil.",
  "You're the reason autocorrect gives up.",
  "If you were any more lost, you'd need a GPS to find your own shadow.",
  "You have the impact of a wet tissue.",
  "If you were any more bland, you'd be unsalted crackers.",
  "You're the reason people pretend to be busy.",
  "If you were any more forgettable, you'd be invisible.",
  "You have the depth of a puddle.",
  "If you were any more useless, you'd be a screen door on a submarine.",
  "You're the reason people say 'never meet your heroes.'",
  "If you were any more disappointing, you'd be a Monday morning.",
  "You have the warmth of a snowman.",
  "If you were any more fake, you'd be a plastic plant.",
  "You're the reason people sigh in group photos.",
  "If you were any more annoying, you'd be a mosquito at bedtime.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roast-me")
    .setDescription("Get roasted by the bot"),
  async execute(interaction) {
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply({ content: roast, ephemeral: false });
  },
};

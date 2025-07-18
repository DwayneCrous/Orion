# Orion Discord Bot

Orion is a multi-purpose Discord bot designed for moderation, utility, and fun. It offers weather and currency APIs, news headlines, moderation tools, interactive mini-games, and more—all powered by [discord.js](https://discord.js.org/).

---

## 🚀 Features

- **Weather API**: Get current weather for any location.
- **News Headlines**: Get the top 3 latest news headlines for South Africa in the daily overview.
- **Currency Converter**: Convert amounts between currencies.
- **Moderation Tools**: Kick, ban, mute users, bulk delete messages, set slowmode, set nicknames, assign roles, and filter bad words (now with per-word toggling and detailed feedback).
- **Role Management**: Assign roles to members directly from Discord.
- **Nickname Management**: Set user nicknames easily.
- **Slowmode Control**: Set slowmode for any text channel.
- **Bad Word Filter**: Enable or disable filtering of specific words, with instant moderation.
- **Mini-Games**: Flip a coin, roll a dice, play rock-paper-scissors.
- **User Utilities**: Get any user's avatar with a single command.
- **Extras**: Quick link to Dwayne's GitHub.

---

## 🛠️ Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/DwayneCrous/Orion.git
   cd Orion
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with the following:

   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_guild_id
   WEATHER_API_KEY=your_openweathermap_api_key
   NEWS_API_KEY=your_newsapi_key
   EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
   ```

4. **Register commands**

   Run the command registration script:

   ```bash
   node src/register-commands.js
   ```

5. **Start the bot**
   ```bash
   node src/index.js
   ```

---

## 📋 Commands

### API & Utility Commands

- `/todays-overview`  
  Get a daily overview with weather and top 3 news headlines for South Africa.
- `/get-weather location:<string> units:<Celsius|Fahrenheit>`  
  Get current weather for a location.
- `/currency-convert amount:<number> from_currency:<string> to_currency:<string>`  
  Convert currency amounts.
- `/get-avatar user:<user>`  
  Get the avatar of any user.
- `/set-role role:<role> member:<user>`  
  Assign a role to a member.
- `/set-nickname user:<user> nickname:<string>`  
  Set a user's nickname for the server.
- `/set-slowmode channel:<channel> duration:<seconds>`  
  Set slowmode for a text channel.

### Moderation

- `/expunge-message amount:<1-100> channel:<channel>`  
  Bulk delete messages in a channel, with feedback on success or errors.
- `/kick-user user:<user> reason:<string>`  
  Kick a user from the server, with detailed error handling.
- `/ban-user user:<user> reason:<string>`  
  Ban a user from the server, with detailed error handling.
- `/mute-user user:<user> duration:<seconds>`  
  Temporarily mute a user, with feedback.
- `/bad-word-filter toggle:<Enable|Disable> word:<string>`  
  Enable or disable filtering of specific words (per-word toggle, instant effect).

### Mini-Games

- `/flip-coin`  
  Flip a coin and get the result in an embed.
- `/dice-roll`  
  Roll a dice (1-6) and see the result in an embed.
- `/rock-paper-scissors choice:<rock|paper|scissors>`  
  Play against the bot with instant feedback and result embed.

### Extras

- `/dwayne-github`  
  Get a link to Dwayne's GitHub profile.

---

## 📝 Contributing

Pull requests and suggestions are welcome! Please open an issue for major changes.

---

## 📄 License

MIT

---

## 👤 Author

[Dwayne Crous](https://github.com/DwayneCrous)

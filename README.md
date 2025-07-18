# Orion Discord Bot

Orion is a multi-purpose Discord bot designed for moderation, utility, and fun. It offers weather and currency APIs, moderation tools, mini-games, and more—all powered by [discord.js](https://discord.js.org/).

---

## 🚀 Features

- **Weather API**: Get current weather for any location.
- **Currency Converter**: Convert amounts between currencies.
- **Moderation Tools**: Kick, ban, mute users, bulk delete messages, and filter bad words.
- **Mini-Games**: Flip a coin, roll a dice, play rock-paper-scissors.
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

### API Commands

- `/get-weather location:<string> units:<Celsius|Fahrenheit>`
  - Get current weather for a location.
- `/currency-convert amount:<number> from_currency:<string> to_currency:<string>`
  - Convert currency amounts.

### Moderation

- `/expunge-message amount:<1-100> channel:<channel>`
  - Bulk delete messages in a channel.
- `/kick-user user:<user> reason:<string>`
  - Kick a user from the server.
- `/ban-user user:<user> reason:<string>`
  - Ban a user from the server.
- `/mute-user user:<user> duration:<seconds>`
  - Temporarily mute a user.
- `/bad-word-filter toggle:<Enable|Disable> word:<string>`
  - Enable/disable filtering of specific words.

### Mini-Games

- `/flip-coin`
  - Flip a coin.
- `/dice-roll`
  - Roll a dice (1-6).
- `/rock-paper-scissors choice:<rock|paper|scissors>`
  - Play against the bot.

### Extras

- `/dwayne-github`
  - Get a link to Dwayne's GitHub profile.

---

## 📝 Contributing

Pull requests and suggestions are welcome! Please open an issue for major changes.

---

## 📄 License

MIT

---

## 👤 Author

[Dwayne Crous](https://github.com/DwayneCrous)

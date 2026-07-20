# 💫 BuddyBot

An AI-powered virtual pet game with a nostalgic early-2000s Flash game vibe (think Neopets / Tamagotchi). BuddyBot's brain is powered by the **Gemini API** — it generates dialogue, reacts emotionally to your actions, remembers past moments, and evolves over time.

## Features
- 🥚 → 🐣 → 🐥 → 🦄 → 🐉 evolution stages
- ❤️ Trust and ⭐ XP stats that grow through interaction
- 💬 AI-generated dialogue that reacts to Feed / Play / Talk / Explore actions
- 🧠 Personality that can shift based on how you treat your pet
- 📔 A memory log so BuddyBot "remembers" your history together
- 🎉 Evolution celebration animation with confetti
- 💾 Progress saved in `localStorage` (client-side, no database needed)

## Tech Stack
- **Frontend:** Plain HTML / CSS / JavaScript (no frameworks)
- **Backend:** Node.js + Express
- **AI:** Google Gemini API (`gemini-2.0-flash`)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your Gemini API key. Copy `.env.example` to `.env` (already provided as `.env` — just edit it):
   ```
   GEMINI_API_KEY=your_real_key_here
   PORT=3000
   ```
   Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to:
   ```
   http://localhost:3000
   ```

## How It Works

1. Player clicks an action button (Feed / Play / Talk / Explore).
2. Frontend sends the pet's current state (name, personality, memories, trust, xp, evolution stage) + the action to `POST /chat`.
3. The backend builds a prompt with all that context and sends it to Gemini.
4. Gemini returns strict JSON:
   ```json
   {
     "message": "BuddyBot's reply",
     "trustChange": 5,
     "xpGain": 10,
     "newMemory": "We played fetch together!",
     "personalityUpdate": "",
     "evolution": false
   }
   ```
5. The frontend updates the speech bubble, stat bars, memory log, and (if `evolution` is true) plays the evolution celebration.

## Notes
- Sound effects are placeholders (`console.log` messages) — swap `playSound()` in `script.js` for real `Audio()` calls once you add `.mp3`/`.wav` files.
- The pet's PNG is currently an emoji placeholder (`🥚🐣🐥🦄🐉` in `EVOLUTION_EMOJIS` in `script.js`) — swap these for `<img>` tags once your pet art is ready.
- All game state lives in `localStorage` under the key `buddybot-pet-data`. Click "🔄 Release Pet" to reset.

## Project Structure
```
BuddyBot/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── .env
└── README.md
```
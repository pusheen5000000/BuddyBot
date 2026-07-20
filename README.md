# BuddyBot! (b ᵔ▽ᵔ)b

BuddyBot is an AI-powered virtual pet that evolves! Starting as an egg, BuddyBot develops its own personality, memories, and evolution path through real time interactions. 

It has 5 stages, egg -> baby -> teen -> adult -> legendary!

I am proud of creating a game where each player's experience is unique. BuddyBot does not have a fixed personality or evolution path, the player and AI shapes the outcome. 
I also loved the idea of combining the nostalgic feeling of classic browser games with AI technology to create an interactive experience to enhance the games!

## Features
Players can:
- Feed, play, talk, and sleep
- Create memories that influence future conversations
- Watch BuddyBot evolve from an egg into a legendary pet

Unlike traditional virtual pets, BuddyBot uses Gemini to generate responses, adapt its personality, and create a different journey for every player.


## Tech Stack
BuddyBot was built as a full-stack web application.

Frontend:
- HTML, CSS, and JavaScript

Backend:
- Node.js + Express server
- Gemini API integration 

AI System:
- Gemini acts as BuddyBot's personality engine
- Each interaction sends the pet's current stats, personality traits, and recent memories to Gemini
- Gemini generates responses, updates trust and XP, creates memories, and determines possible evolution changes

Pet data is stored locally so each player's BuddyBot maintains its unique journey.

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
## Project Structure

```
BuddyBot/
├── public/
│   ├── index.html        
│   ├── style.css         
│   ├── script.js         
│   ├── images/           
│   └── sounds/           
│
├── server.js           
├── package.json        
├── .env
├── .gitignore               
└── README.md             
```

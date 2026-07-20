require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function buildPrompt({ name, personality, memories, trust, xp, evolutionStage, action }) {
  const memoryText = (memories && memories.length)
    ? memories.slice(-5).join(' | ')
    : 'No memories yet, this is a new friendship.';

  return `You are the AI brain behind a virtual pet character in a nostalgic 2000s-style browser game called BuddyBot.

BuddyBot's profile:
- Name: ${name}
- Personality: ${personality}
- Evolution stage: ${evolutionStage} (0 = Egg, 1 = Baby, 2 = Teen, 3 = Adult, 4 = Legendary)
- Current Trust: ${trust} (0-100)
- Current XP: ${xp}
- Recent memories: ${memoryText}

The player just performed this action: "${action}"

Respond ONLY in strict JSON, no markdown, no code fences, no extra text. Use this exact schema:
{
  "message": "a short, cute, in-character reply from BuddyBot reacting to the action (max 2 sentences)",
  "trustChange": integer between -5 and 10,
  "xpGain": integer between 0 and 15,
  "newMemory": "a short first-person memory string BuddyBot will remember about this moment",
  "personalityUpdate": "a short new personality descriptor if it should change, otherwise empty string",
  "evolution": "true" or "false" - whether this action should trigger evolving to the next stage (only if trust and xp are reasonably high, be sparing with evolutions),
  "sleepMinutes": integer - ONLY relevant if the action is "sleep". Pick a whole number of minutes between 1 and 10 for how long BuddyBot naps, based on its mood/energy. If the action is not "sleep", always return 0.
}

Keep BuddyBot's tone playful, warm, and consistent with a Tamagotchi/Neopets style companion. React emotionally and specifically to the action given. If the action is "sleep", the message should be a sleepy little goodnight line.`;
}

function safeParseJSON(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}
async function generatePersonality(name, eggType) {
  const prompt = `
You are creating the personality of a virtual AI pet called BuddyBot.

Pet name: ${name}
Egg type: ${eggType}

Create a unique cute personality.

Return ONLY JSON:

{
  "personality": "short personality description",
  "favoriteThing": "something they love",
  "backstory": "one cute sentence"
}

Make it feel like a Tamagotchi/Neopets companion.
`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 200
      }
    })
  });

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return JSON.parse(
    text.replace(/```json/g, '').replace(/```/g, '').trim()
  );
}
app.post('/create-personality', async (req, res) => {
  try {
    const { name, eggType } = req.body;

    const personality = await generatePersonality(name, eggType);

    res.json(personality);

  } catch (err) {
    console.error(err);

    res.json({
      personality: "curious and friendly",
      favoriteThing: "making friends",
      backstory: "A tiny BuddyBot waiting for adventures!"
    });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { name, personality, memories, trust, xp, evolutionStage, action } = req.body;

    if (!action || !name) {
      return res.status(400).json({ error: 'Missing required fields: name and action' });
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'paste_your_gemini_api_key_here') {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server (.env)' });
    }

    const prompt = buildPrompt({
      name,
      personality: personality || 'curious and friendly',
      memories: memories || [],
      trust: trust ?? 50,
      xp: xp ?? 0,
      evolutionStage: evolutionStage ?? 0,
      action
    });

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 300 }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return res.status(502).json({ error: 'Gemini API request failed' });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = safeParseJSON(rawText);

    if (!parsed) {
      return res.json({
        message: "Hmm, I got a little dizzy trying to think. Try again?",
        trustChange: 0,
        xpGain: 0,
        newMemory: '',
        personalityUpdate: '',
        evolution: false,
        sleepMinutes: 0
      });
    }

    res.json({
      message: parsed.message || "...",
      trustChange: Number(parsed.trustChange) || 0,
      xpGain: Number(parsed.xpGain) || 0,
      newMemory: parsed.newMemory || '',
      personalityUpdate: parsed.personalityUpdate || '',
      evolution: parsed.evolution === true || parsed.evolution === 'true',
      sleepMinutes: Number(parsed.sleepMinutes) || 0
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

app.listen(PORT, () => {
  console.log(`BuddyBot server running at http://localhost:${PORT}`);
});
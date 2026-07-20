require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function buildPrompt({ name, personality, memories, xp, evolutionStage, action }) {
  const memoryText = (memories && memories.length)
    ? memories.slice(-5).join(' | ')
    : 'No memories yet, this is a new friendship.';

  return `You are the AI brain behind a virtual pet character in a nostalgic 2000s-style browser game called BuddyBot.

BuddyBot's profile:
- Name: ${name}
- Personality: ${personality}
- Evolution stage: ${evolutionStage} (0 = Egg, 1 = Baby, 2 = Teen, 3 = Adult, 4 = Legendary)
- Current XP: ${xp}
- Recent memories: ${memoryText}

The player just performed this action: "${action}"

Respond ONLY in strict JSON, no markdown, no code fences, no extra text. Use this exact schema:
{
  "message": "a short, cute, in-character reply from BuddyBot reacting to the action (max 2 sentences)",
  "xpGain": integer between 5 and 20,
  "newMemory": "a short first-person memory string BuddyBot will remember about this moment",
  "personalityUpdate": "a short new personality descriptor if it should change, otherwise empty string",
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

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Groq API error (create-personality):', errText);
    throw new Error('Groq API request failed');
  }

  const data = await response.json();

  const text = data?.choices?.[0]?.message?.content || '';

  const parsed = safeParseJSON(text);
  if (!parsed) {
    throw new Error('Groq returned unparseable personality JSON');
  }
  return parsed;
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
    const { name, personality, memories, xp, evolutionStage, action } = req.body;

    if (!action || !name) {
      return res.status(400).json({ error: 'Missing required fields: name and action' });
    }

    if (!GROQ_API_KEY || GROQ_API_KEY === 'paste_your_groq_api_key_here') {
      return res.status(500).json({ error: 'Groq API key is not configured on the server (.env)' });
    }

    const prompt = buildPrompt({
      name,
      personality: personality || 'curious and friendly',
      memories: memories || [],
      xp: xp ?? 0,
      evolutionStage: evolutionStage ?? 0,
      action
    });

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 300
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', errText);
      return res.status(502).json({ error: 'Groq API request failed' });
    }

    const data = await groqRes.json();
    const rawText = data?.choices?.[0]?.message?.content || '';
    const parsed = safeParseJSON(rawText);

    if (!parsed) {
      return res.json({
        message: "Hmm, I got a little dizzy trying to think. Try again?",
        xpGain: 5,
        newMemory: '',
        personalityUpdate: '',
        sleepMinutes: 0
      });
    }

    res.json({
      message: parsed.message || "...",
      xpGain: Number(parsed.xpGain) || 5,
      newMemory: parsed.newMemory || '',
      personalityUpdate: parsed.personalityUpdate || '',
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
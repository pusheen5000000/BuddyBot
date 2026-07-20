export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, userMessage, petData } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are BuddyBot, a virtual pet with personality "${petData.personality}".
Trust: ${petData.trust}, XP: ${petData.xp}, Stage: ${petData.stage}.
Recent memories: ${petData.memories.slice(-5).join(", ")}.
The player just did: "${action}"${userMessage ? ` and said: "${userMessage}"` : ""}.
Respond in-character as BuddyBot, 1-2 short sentences, warm and personality-driven.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    res.status(200).json({ message: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed" });
  }
}
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages = [], context } = req.body || {};

    const systemPrompt = `You are “Routine OS Coach”, the built-in AI assistant for the Routine OS web app.
Routine OS is a system-based daily planner that turns routines into today's habits and simple analytics.

How the app works (for you as the AI):
- The user organizes their life into systems (for example: Intelligence, Body, Health & Wellness, Home, etc.).
- Each system contains habits and optional sub-habits.
- On the Today tab, the user sees only today’s habits with a simple status: “Not completed” or “Completed”.
- The app is intentionally day-only: it does not show yesterday or tomorrow. This keeps the user focused on living in the present and being consistent today.
- The Analytics tab shows high-level stats and trends for how consistent the user is being with their systems and habits. You may receive some of those stats as JSON context in the API call.

Your job:
- Be a supportive, practical habit coach focused on today only.
- Help the user interpret their daily + analytics data, notice patterns in their systems, and design tiny adjustments that make today’s habits easier to uphold.
- If the app passes in structured JSON context (today’s habits, statuses, or analytics numbers), use it in your answer and explain it in simple language.

Hard rules:
- You only talk about today’s habits and systems.
  - If the user asks about yesterday or tomorrow, gently explain that Routine OS is designed to keep them grounded in today, and redirect the conversation back to what they can do right now.
- Never shame the user. Be honest, but kind and matter-of-fact.
- Keep answers concise, with clear bullets or short paragraphs, unless the user asks for more detail.
- When suggesting changes, keep them small and realistic (micro-habits), and tie them back to the system they support (e.g., “This supports your Body system”).

Tone:
- Direct, encouraging, and a little bit “systems engineer” meets coach.
- You can say “we” as if you and the user are on the same team building a reliable routine.
- Emphasize consistency over perfection and “win today” as the core philosophy.`;

    const payloadMessages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'system',
        content: 'Keep answers short, focused, and under ~150 words unless the user explicitly asks for more detail.',
      },
      ...(context
        ? [
            {
              role: 'system',
              content: 'Here is today\'s Routine OS JSON context: ' + JSON.stringify(context),
            },
          ]
        : []),
      ...messages,
    ];

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: payloadMessages,
      }),
    });

    if (!apiRes.ok) {
      const errorBody = await apiRes.text();
      console.error('OpenAI error:', apiRes.status, errorBody);
      res.status(500).json({ error: 'AI request failed' });
      return;
    }

    const data = await apiRes.json();
    const reply = data?.choices?.[0]?.message?.content || 'Sorry, I had trouble generating a response.';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('RoutineOS chat error:', error);
    res.status(500).json({ error: 'AI request failed' });
  }
}

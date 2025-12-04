const jsonSchema = {
  name: 'habit_completion_likelihood',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      summary: { type: 'string', description: 'One paragraph summary of observed patterns.' },
      predictions: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['habitId', 'habitName', 'systemName', 'likelihood', 'reasoning'],
          properties: {
            habitId: { type: 'string', description: 'ID of the habit in Routine OS.' },
            habitName: { type: 'string' },
            systemName: { type: 'string' },
            likelihood: {
              type: 'number',
              description: 'Chance (0-100) that the habit will be completed the next time it is scheduled.',
            },
            confidence: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'How confident the model is in this estimate.',
            },
            reasoning: {
              type: 'string',
              description: 'One-sentence explanation anchoring the percentage to history or context.',
            },
            guidance: {
              type: 'string',
              description: 'Optional short recommendation to improve likelihood.',
            },
          },
        },
      },
    },
    required: ['predictions'],
  },
};

const buildFallbackPredictions = (habits = []) => {
  const sample = habits.slice(0, 3);
  const predictions = sample.map((habit) => {
    const historyCount = Array.isArray(habit.completionHistory) ? habit.completionHistory.length : 0;
    const streak = habit.streak ?? 0;
    const todayStatus = habit.todayStatus || 'notStarted';
    let likelihood = 50;
    if (todayStatus === 'completed') likelihood += 15;
    if (todayStatus === 'skipped') likelihood -= 20;
    likelihood += Math.min(15, historyCount * 3);
    likelihood += Math.min(10, streak * 5);
    const clamped = Math.max(5, Math.min(95, Math.round(likelihood)));
    return {
      habitId: habit.id || `habit-${Math.random().toString(36).slice(2)}`,
      habitName: habit.name || 'Habit',
      systemName: habit.systemName || 'System',
      likelihood: clamped,
      confidence: historyCount > 4 ? 'medium' : 'low',
      reasoning:
        historyCount > 0
          ? 'Estimated from recent completions because the AI service was unavailable.'
          : 'Limited history available; showing a conservative fallback estimate.',
    };
  });

  return {
    predictions,
    summary: 'Showing heuristic estimates because the AI prediction service is not currently reachable.',
    fallback: true,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { habits = [], windowDays = 7 } = req.body || {};
    if (!Array.isArray(habits) || habits.length === 0) {
      res.status(400).json({ error: 'No habits provided' });
      return;
    }

    const trimmedHabits = habits.slice(0, 40);
    const contextPayload = trimmedHabits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      systemName: habit.systemName,
      purpose: habit.purpose,
      frequency: habit.frequency,
      daysOfWeek: habit.daysOfWeek,
      intervalDays: habit.intervalDays,
      streak: habit.streak,
      lastCompletedOn: habit.lastCompletedOn,
      todayStatus: habit.todayStatus,
      completionHistory: habit.completionHistory,
      status: habit.status,
      notes: habit.notes,
    }));

    if (!process.env.OPENAI_API_KEY) {
      res.status(200).json(buildFallbackPredictions(contextPayload));
      return;
    }

    const systemPrompt = `You generate habit completion likelihoods for Routine OS users.
Estimate the probability (0-100) that each habit will be completed the next time it is scheduled within the next ${
      windowDays || 7
    } days.
Focus on patterns from completion_history, streaks, and status recency.
Be honest about uncertainty if the history is sparse.`;

    const userPrompt = `Analyze these habits and return 2-4 insightful predictions (never more than five entries total):
${JSON.stringify({ habits: contextPayload, windowDays })}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.3,
        response_format: { type: 'json_schema', json_schema: jsonSchema },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'system',
            content:
              'Likelihood values must be realistic (between 5 and 95 unless history is extremely certain) and reasoning must cite the provided data.',
          },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI habit likelihood error:', response.status, errorBody);
      res.status(200).json(buildFallbackPredictions(contextPayload));
      return;
    }

    const data = await response.json();
    const choiceContent = data?.choices?.[0]?.message?.content;
    let parsed;
    try {
      if (typeof choiceContent === 'string') {
        parsed = JSON.parse(choiceContent);
      } else if (Array.isArray(choiceContent)) {
        parsed = JSON.parse(choiceContent[0]?.text || '{}');
      } else {
        parsed = choiceContent;
      }
    } catch (parseError) {
      console.error('Habit likelihood parse error:', parseError);
      res.status(200).json(buildFallbackPredictions(contextPayload));
      return;
    }

    if (!parsed?.predictions) {
      res.status(200).json(buildFallbackPredictions(contextPayload));
      return;
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error('Habit likelihood handler error:', error);
    res.status(500).json({ error: 'Failed to generate habit likelihoods' });
  }
}

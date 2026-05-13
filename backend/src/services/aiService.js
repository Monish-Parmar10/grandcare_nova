/**
 * AI Service for GrandCare
 * This service will eventually connect to Grok, Gemini, or other AI APIs.
 * It suggests personalized daily tasks based on user details.
 */

export const suggestDailyTasks = async (userData) => {
  // Placeholder: In the future, this would call an external AI API (like Grok)
  // For now, it returns a simulated suggestion based on the user's role/data
  

  // Simulated logic
  const suggestions = [
    {
      title: 'Mindful Meditation',
      description: 'Spend 5 minutes in quiet reflection to boost mental clarity.',
      points: 20,
      source: 'ai'
    },
    {
      title: 'Gentle Stretching',
      description: 'Perform 10 minutes of light stretches to improve flexibility.',
      points: 15,
      source: 'ai'
    }
  ];

  return suggestions;
};

export const generateAIRoutinesAdaptive = async (elder, existingTasks, adjustmentMode) => {
  try {
    const RoutineTask = (await import('./models/RoutineTask.js')).default;
    
    // Choose 2-3 tasks to adjust
    const tasksToAdjust = existingTasks.slice(0, 3);
    const taskDetails = tasksToAdjust.map(t => ({ id: t._id, title: t.title, description: t.description }));

    const grokPrompt = `
You are adjusting a daily routine for a senior citizen.
Mode: ${adjustmentMode}
Current tasks: ${JSON.stringify(taskDetails)}

If mode is 'harder', suggest slightly more challenging versions (e.g. "10 minute walk" -> "15 minute walk").
If mode is 'easier', simplify the tasks to make them more achievable.

Return ONLY a valid JSON array, no explanation, no markdown:
[
{
"id": "original_task_id",
"title": "new task name",
"description": "new encouraging description"
}
]
`;

    const apiKey = process.env.GROK_API_KEY;
    
    // Dynamically import fetch if needed or just use global fetch
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [{ role: 'user', content: grokPrompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonStr = content.replace(/^```json/, '').replace(/```$/, '').trim();
    const suggestions = JSON.parse(jsonStr);

    for (const sug of suggestions) {
      if (sug.id) {
        await RoutineTask.findByIdAndUpdate(sug.id, {
          title: sug.title,
          description: sug.description
        });
      }
    }

    if (adjustmentMode === 'easier') {
      // add one easier bonus task
      await RoutineTask.create({
        user: elder._id,
        title: 'Take a Rest',
        description: 'Sit back and relax for 10 minutes',
        points: 5,
        category: 'health',
        icon: '🛋️',
        timeOfDay: 'afternoon',
        source: 'ai'
      });
    }

  } catch (err) {
    console.error('Error in generateAIRoutinesAdaptive:', err);
  }
};


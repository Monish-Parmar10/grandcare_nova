import NewsQuizQuestion from '../models/NewsQuizQuestion.js';
import User from '../models/User.js';

// @desc    Get today's quiz questions
// @route   GET /api/quiz/today
// @access  Private (Elder)
export const getTodayQuiz = async (req, res, next) => {
  try {
    const city = req.user.city;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (city) {
      // Skip checking for existing today's questions to ensure user gets a fresh experience every visit

      // 2. If not, generate new ones using AI
      const apiKey = process.env.GROK_API_KEY;
      const grokPrompt = `
        You are a local news expert for the city of ${city}, India. 
        Generate exactly 3 multiple-choice quiz questions based on current events, local landmarks, famous people, or cultural facts specific to ${city}.
        These should be interesting for an elderly person who reads the newspaper daily.
        
        Return ONLY a valid JSON array of objects, no explanation, no markdown, NO backticks.
        Format:
        [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctIndex": 0,
            "points": 10
          }
        ]
      `;

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'GrandCare'
          },
          body: JSON.stringify({
            model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            messages: [{ role: 'user', content: grokPrompt }],
            temperature: 0.7
          })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content.trim();
          const jsonStr = content.replace(/^```json/, '').replace(/```$/, '').trim();
          const aiQuestions = JSON.parse(jsonStr);

          if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
            const savedQuestions = await NewsQuizQuestion.insertMany(aiQuestions.map(q => ({
              ...q,
              city,
              isAI: true
            })));

            return res.json(savedQuestions.map(q => ({
              id: q._id,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              points: q.points,
            })));
          }
        }
      } catch (aiError) {
        console.error('AI Quiz Generation failed:', aiError);
        // Fallback to random questions below
      }
    }

    // Fallback: return 3 random questions from general pool
    const questions = await NewsQuizQuestion.aggregate([{ $sample: { size: 3 } }]);
    
    const formattedQuestions = questions.map(q => ({
      id: q._id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      points: q.points,
    }));

    res.json(formattedQuestions);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and compute score
// @route   POST /api/quiz/submit
// @access  Private (Elder)
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of { questionId, selectedIndex }

    if (!answers || !Array.isArray(answers)) {
      res.status(400);
      throw new Error('Answers are required');
    }

    let score = 0;
    let pointsAwarded = 0;

    for (const answer of answers) {
      const question = await NewsQuizQuestion.findById(answer.questionId);
      if (question && question.correctIndex === answer.selectedIndex) {
        score++;
        pointsAwarded += question.points;
      }
    }

    // Increase user's grandScore
    const user = await User.findById(req.user._id);
    user.grandScore += pointsAwarded;
    await user.save();

    res.json({
      score,
      total: answers.length,
      pointsAwarded,
      grandScore: user.grandScore,
    });
  } catch (error) {
    next(error);
  }
};

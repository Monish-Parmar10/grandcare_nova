import { GoogleGenerativeAI } from '@google/generative-ai';
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
      const apiKey = process.env.GEMINI_API_KEY_2;
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
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' }
        });

        const result = await model.generateContent(grokPrompt);
        const content = result.response.text().trim();
        
        // Extract JSON array robustly by finding [ and ]
        const startIndex = content.indexOf('[');
        const endIndex = content.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1) {
          const jsonStr = content.substring(startIndex, endIndex + 1);
          const aiQuestions = JSON.parse(jsonStr);

          if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
            // Normalize questions to match the schema
            const formattedAIQuestions = aiQuestions.map(q => {
              const question = q.question || q.questionText || q.q || "";
              const options = Array.isArray(q.options) ? q.options : (Array.isArray(q.choices) ? q.choices : []);
              
              let correctIndex = q.correctIndex;
              if (correctIndex === undefined) {
                correctIndex = q.correct_index !== undefined ? q.correct_index : (q.correct !== undefined ? q.correct : 0);
              }
              correctIndex = parseInt(correctIndex, 10);
              if (isNaN(correctIndex)) correctIndex = 0;

              let points = q.points;
              if (points === undefined) {
                points = q.score !== undefined ? q.score : 10;
              }
              points = parseInt(points, 10);
              if (isNaN(points)) points = 10;

              return {
                question,
                options,
                correctIndex,
                points
              };
            });

            const savedQuestions = await NewsQuizQuestion.insertMany(formattedAIQuestions.map(q => ({
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
      if (question && Number(question.correctIndex) === Number(answer.selectedIndex)) {
        score++;
        pointsAwarded += (Number(question.points) || 0);
      }
    }

    // Increase user's grandScore safely
    const user = await User.findById(req.user._id);
    user.grandScore = (Number(user.grandScore) || 0) + pointsAwarded;
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

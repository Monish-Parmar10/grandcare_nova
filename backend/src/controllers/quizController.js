import NewsQuizQuestion from '../models/NewsQuizQuestion.js';
import User from '../models/User.js';

// @desc    Get today's quiz questions
// @route   GET /api/quiz/today
// @access  Private (Elder)
export const getTodayQuiz = async (req, res, next) => {
  try {
    // For simplicity, just return 3 random questions
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
      newGrandScore: user.grandScore,
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from 'mongoose';

const newsQuizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctIndex: {
      type: Number,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 10,
    },
    city: {
      type: String,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const NewsQuizQuestion = mongoose.model('NewsQuizQuestion', newsQuizQuestionSchema);

export default NewsQuizQuestion;
